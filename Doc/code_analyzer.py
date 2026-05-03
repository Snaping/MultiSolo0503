import os
import re
import ast
from pathlib import Path

class CodeAnalyzer:
    def __init__(self, repo_path):
        self.repo_path = repo_path
        self.modules = []
        self.classes = []
        self.functions = []
        self.dependencies = []
        self.tech_stack = set()
        self.directory_structure = {}
    
    def analyze(self):
        self._build_directory_structure()
        self._scan_files()
        self._detect_tech_stack()
    
    def _build_directory_structure(self):
        self.directory_structure = self._scan_dir(self.repo_path)
    
    def _scan_dir(self, path, level=0):
        structure = {}
        try:
            for item in os.listdir(path):
                if item.startswith('.'):
                    continue
                item_path = os.path.join(path, item)
                rel_path = os.path.relpath(item_path, self.repo_path)
                
                if os.path.isdir(item_path):
                    structure[item] = self._scan_dir(item_path, level + 1)
                else:
                    structure[item] = 'file'
        except Exception:
            pass
        return structure
    
    def _scan_files(self):
        for root, dirs, files in os.walk(self.repo_path):
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            
            for file in files:
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, self.repo_path)
                
                if file.endswith('.py'):
                    self._analyze_python_file(file_path, rel_path)
                elif file.endswith('.js') or file.endswith('.jsx'):
                    self._analyze_js_file(file_path, rel_path)
                elif file.endswith('.ts') or file.endswith('.tsx'):
                    self._analyze_ts_file(file_path, rel_path)
                elif file.endswith('.java'):
                    self._analyze_java_file(file_path, rel_path)
                elif file in ['package.json', 'requirements.txt', 'pom.xml', 'go.mod', 'Cargo.toml']:
                    self._analyze_config_file(file_path, rel_path)
    
    def _analyze_python_file(self, file_path, rel_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            self.modules.append({
                'name': rel_path,
                'path': file_path,
                'type': 'python'
            })
            
            tree = ast.parse(content)
            
            for node in ast.walk(tree):
                if isinstance(node, ast.ClassDef):
                    self.classes.append({
                        'name': node.name,
                        'module': rel_path,
                        'methods': [n.name for n in node.body if isinstance(n, ast.FunctionDef)],
                        'bases': [self._get_name(base) for base in node.bases]
                    })
                
                if isinstance(node, ast.FunctionDef) and not hasattr(node, 'is_method'):
                    self.functions.append({
                        'name': node.name,
                        'module': rel_path,
                        'params': [arg.arg for arg in node.args.args]
                    })
            
            for node in ast.walk(tree):
                if isinstance(node, ast.Import):
                    for name in node.names:
                        self.dependencies.append({
                            'from': rel_path,
                            'to': name.name,
                            'type': 'import'
                        })
                elif isinstance(node, ast.ImportFrom):
                    module = node.module or ''
                    for name in node.names:
                        self.dependencies.append({
                            'from': rel_path,
                            'to': f"{module}.{name.name}" if module else name.name,
                            'type': 'import_from'
                        })
        except Exception:
            pass
    
    def _get_name(self, node):
        if isinstance(node, ast.Name):
            return node.id
        elif isinstance(node, ast.Attribute):
            return f"{self._get_name(node.value)}.{node.attr}"
        return str(node)
    
    def _analyze_js_file(self, file_path, rel_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            self.modules.append({
                'name': rel_path,
                'path': file_path,
                'type': 'javascript'
            })
            
            class_pattern = r'class\s+(\w+)'
            classes = re.findall(class_pattern, content)
            for cls in classes:
                self.classes.append({
                    'name': cls,
                    'module': rel_path,
                    'methods': [],
                    'bases': []
                })
            
            func_pattern = r'function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\(?'
            functions = re.findall(func_pattern, content)
            for func in functions:
                name = func[0] or func[1]
                if name:
                    self.functions.append({
                        'name': name,
                        'module': rel_path,
                        'params': []
                    })
        except Exception:
            pass
    
    def _analyze_ts_file(self, file_path, rel_path):
        self._analyze_js_file(file_path, rel_path)
        self.modules[-1]['type'] = 'typescript'
    
    def _analyze_java_file(self, file_path, rel_path):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            self.modules.append({
                'name': rel_path,
                'path': file_path,
                'type': 'java'
            })
            
            class_pattern = r'(?:public|private|protected)?\s*(?:abstract)?\s*class\s+(\w+)'
            classes = re.findall(class_pattern, content)
            for cls in classes:
                self.classes.append({
                    'name': cls,
                    'module': rel_path,
                    'methods': [],
                    'bases': []
                })
        except Exception:
            pass
    
    def _analyze_config_file(self, file_path, rel_path):
        self.modules.append({
            'name': rel_path,
            'path': file_path,
            'type': 'config'
        })
    
    def _detect_tech_stack(self):
        config_files = {
            'package.json': 'Node.js',
            'requirements.txt': 'Python',
            'setup.py': 'Python',
            'pyproject.toml': 'Python',
            'pom.xml': 'Java',
            'build.gradle': 'Java',
            'go.mod': 'Go',
            'Cargo.toml': 'Rust',
            'Gemfile': 'Ruby',
            'composer.json': 'PHP'
        }
        
        for root, dirs, files in os.walk(self.repo_path):
            for file in files:
                if file in config_files:
                    self.tech_stack.add(config_files[file])
                
                if file.endswith('.py'):
                    self.tech_stack.add('Python')
                elif file.endswith('.js') or file.endswith('.jsx'):
                    self.tech_stack.add('JavaScript')
                elif file.endswith('.ts') or file.endswith('.tsx'):
                    self.tech_stack.add('TypeScript')
                elif file.endswith('.java'):
                    self.tech_stack.add('Java')
                elif file.endswith('.go'):
                    self.tech_stack.add('Go')
                elif file.endswith('.rs'):
                    self.tech_stack.add('Rust')
                elif file.endswith('.vue'):
                    self.tech_stack.add('Vue.js')
                elif file.endswith('.html'):
                    self.tech_stack.add('HTML')
                elif file.endswith('.css') or file.endswith('.scss') or file.endswith('.less'):
                    self.tech_stack.add('CSS')
                
                if 'react' in file.lower():
                    self.tech_stack.add('React')
                if 'angular' in file.lower():
                    self.tech_stack.add('Angular')
                if 'django' in file.lower():
                    self.tech_stack.add('Django')
                if 'flask' in file.lower():
                    self.tech_stack.add('Flask')
                if 'spring' in file.lower():
                    self.tech_stack.add('Spring')

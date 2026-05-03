import os
from datetime import datetime

class DocGenerator:
    def __init__(self, analyzer):
        self.analyzer = analyzer
    
    def generate(self, output_path):
        content = self._generate_content()
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return output_path
    
    def _generate_content(self):
        content = f"# 项目文档\n\n"
        content += f"**生成时间**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
        
        content += self._generate_toc()
        content += self._generate_overview()
        content += self._generate_tech_stack()
        content += self._generate_architecture()
        content += self._generate_modules()
        content += self._generate_classes()
        content += self._generate_interaction()
        content += self._generate_uml()
        
        return content
    
    def _generate_toc(self):
        content = "## 目录\n\n"
        content += "1. [项目概述](#项目概述)\n"
        content += "2. [技术栈](#技术栈)\n"
        content += "3. [组织架构](#组织架构)\n"
        content += "4. [模块功能](#模块功能)\n"
        content += "5. [类说明](#类说明)\n"
        content += "6. [模块交互](#模块交互)\n"
        content += "7. [UML图表](#uml图表)\n\n"
        return content
    
    def _generate_overview(self):
        content = "## 项目概述\n\n"
        content += "本项目文档通过自动化工具生成，包含项目的组织架构、技术路线、模块功能以及模块交互等信息。\n\n"
        content += f"- **模块数量**: {len(self.analyzer.modules)}\n"
        content += f"- **类数量**: {len(self.analyzer.classes)}\n"
        content += f"- **函数数量**: {len(self.analyzer.functions)}\n\n"
        return content
    
    def _generate_tech_stack(self):
        content = "## 技术栈\n\n"
        if self.analyzer.tech_stack:
            content += "### 检测到的技术\n\n"
            for tech in sorted(self.analyzer.tech_stack):
                content += f"- {tech}\n"
        else:
            content += "未检测到明确的技术栈信息\n"
        content += "\n"
        return content
    
    def _generate_architecture(self):
        content = "## 组织架构\n\n"
        content += "### 目录结构\n\n"
        content += "```\n"
        content += self._format_directory_structure(self.analyzer.directory_structure, "")
        content += "```\n\n"
        return content
    
    def _format_directory_structure(self, structure, indent):
        result = ""
        for key, value in sorted(structure.items()):
            if isinstance(value, dict):
                result += f"{indent}{key}/\n"
                result += self._format_directory_structure(value, indent + "  ")
            else:
                result += f"{indent}{key}\n"
        return result
    
    def _generate_modules(self):
        content = "## 模块功能\n\n"
        if not self.analyzer.modules:
            content += "未检测到模块\n\n"
            return content
        
        modules_by_type = {}
        for module in self.analyzer.modules:
            mod_type = module.get('type', 'unknown')
            if mod_type not in modules_by_type:
                modules_by_type[mod_type] = []
            modules_by_type[mod_type].append(module)
        
        for mod_type, modules in sorted(modules_by_type.items()):
            content += f"### {mod_type.upper()} 模块\n\n"
            for module in sorted(modules, key=lambda x: x['name']):
                content += f"- **{module['name']}**\n"
            content += "\n"
        
        return content
    
    def _generate_classes(self):
        content = "## 类说明\n\n"
        if not self.analyzer.classes:
            content += "未检测到类\n\n"
            return content
        
        classes_by_module = {}
        for cls in self.analyzer.classes:
            module = cls.get('module', 'unknown')
            if module not in classes_by_module:
                classes_by_module[module] = []
            classes_by_module[module].append(cls)
        
        for module, classes in sorted(classes_by_module.items()):
            content += f"### {module}\n\n"
            for cls in classes:
                content += f"#### {cls['name']}\n\n"
                if cls.get('bases'):
                    content += f"- 继承: {', '.join(cls['bases'])}\n"
                if cls.get('methods'):
                    content += f"- 方法: {', '.join(cls['methods'])}\n"
                content += "\n"
        
        return content
    
    def _generate_interaction(self):
        content = "## 模块交互\n\n"
        if not self.analyzer.dependencies:
            content += "未检测到明确的模块依赖关系\n\n"
            return content
        
        content += "### 依赖关系\n\n"
        for dep in self.analyzer.dependencies[:50]:
            content += f"- `{dep['from']}` → `{dep['to']}` ({dep['type']})\n"
        
        if len(self.analyzer.dependencies) > 50:
            content += f"\n... 还有 {len(self.analyzer.dependencies) - 50} 个依赖关系\n"
        
        content += "\n"
        return content
    
    def _generate_uml(self):
        content = "## UML图表\n\n"
        content += "### 用例图\n\n"
        content += "```plantuml\n"
        content += "@startuml\n"
        content += "left to right direction\n"
        content += "actor User\n"
        content += "rectangle \"系统\" {\n"
        content += "  usecase \"使用主要功能\" as UC1\n"
        content += "  usecase \"配置系统\" as UC2\n"
        content += "  usecase \"查看结果\" as UC3\n"
        content += "}\n"
        content += "User --> UC1\n"
        content += "User --> UC2\n"
        content += "User --> UC3\n"
        content += "@enduml\n"
        content += "```\n\n"
        
        content += "### 类图\n\n"
        content += "```plantuml\n"
        content += "@startuml\n"
        if self.analyzer.classes:
            for cls in self.analyzer.classes[:20]:
                content += f"class {cls['name']} {{\n"
                if cls.get('methods'):
                    for method in cls['methods'][:5]:
                        content += f"  + {method}()\n"
                content += "}\n"
        content += "@enduml\n"
        content += "```\n\n"
        
        content += "### 活动图\n\n"
        content += "```plantuml\n"
        content += "@startuml\n"
        content += "start\n"
        content += ":初始化系统;\n"
        content += ":加载配置;\n"
        content += "if (配置正确?) then (是)\n"
        content += "  :执行主要逻辑;\n"
        content += "  :生成结果;\n"
        content += "else (否)\n"
        content += "  :报错提示;\n"
        content += "endif\n"
        content += "stop\n"
        content += "@enduml\n"
        content += "```\n\n"
        
        return content
    
    def generate_uml_diagrams(self, output_dir):
        uml_dir = os.path.join(output_dir, 'diagrams')
        if not os.path.exists(uml_dir):
            os.makedirs(uml_dir)
        
        use_case_content = """@startuml
left to right direction
actor User
rectangle "系统" {
  usecase "使用主要功能" as UC1
  usecase "配置系统" as UC2
  usecase "查看结果" as UC3
}
User --> UC1
User --> UC2
User --> UC3
@enduml
"""
        
        class_content = "@startuml\n"
        if self.analyzer.classes:
            for cls in self.analyzer.classes[:30]:
                class_content += f"class {cls['name']} {{\n"
                if cls.get('methods'):
                    for method in cls['methods'][:5]:
                        class_content += f"  + {method}()\n"
                class_content += "}\n"
        class_content += "@enduml\n"
        
        activity_content = """@startuml
start
:初始化系统;
:加载配置;
if (配置正确?) then (是)
  :执行主要逻辑;
  :生成结果;
else (否)
  :报错提示;
endif
stop
@enduml
"""
        
        with open(os.path.join(uml_dir, 'use_case.puml'), 'w', encoding='utf-8') as f:
            f.write(use_case_content)
        
        with open(os.path.join(uml_dir, 'class_diagram.puml'), 'w', encoding='utf-8') as f:
            f.write(class_content)
        
        with open(os.path.join(uml_dir, 'activity_diagram.puml'), 'w', encoding='utf-8') as f:
            f.write(activity_content)

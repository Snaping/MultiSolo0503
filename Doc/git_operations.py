import os
import git
import re
from git.exc import GitCommandError

class GitManager:
    def __init__(self, repo_path):
        self.repo_path = repo_path
        self.repo = None
    
    def _extract_repo_name(self, repo_url):
        match = re.search(r'([^/]+?)(\.git)?$', repo_url)
        if match:
            return match.group(1)
        return "repository"
    
    def clone(self, repo_url):
        repo_name = self._extract_repo_name(repo_url)
        target_path = os.path.join(self.repo_path, repo_name)
        
        if os.path.exists(target_path):
            if os.path.exists(os.path.join(target_path, ".git")):
                self.repo = git.Repo(target_path)
                return self.repo
        
        if not os.path.exists(self.repo_path):
            os.makedirs(self.repo_path, exist_ok=True)
        
        self.repo = git.Repo.clone_from(repo_url, target_path)
        self.repo_path = target_path
        return self.repo
    
    def pull(self):
        if not self.repo:
            if os.path.exists(os.path.join(self.repo_path, ".git")):
                self.repo = git.Repo(self.repo_path)
            else:
                raise Exception("仓库不存在，请先克隆")
        
        origin = self.repo.remote(name='origin')
        origin.pull()
        return self.repo
    
    def get_commit_history(self, max_count=10):
        if not self.repo:
            self.repo = git.Repo(self.repo_path)
        
        commits = []
        for commit in self.repo.iter_commits(max_count=max_count):
            commits.append({
                'hash': commit.hexsha,
                'author': commit.author.name,
                'email': commit.author.email,
                'date': commit.committed_datetime,
                'message': commit.message.strip()
            })
        return commits
    
    def get_branches(self):
        if not self.repo:
            self.repo = git.Repo(self.repo_path)
        
        branches = []
        for branch in self.repo.branches:
            branches.append(branch.name)
        return branches
    
    def get_current_branch(self):
        if not self.repo:
            self.repo = git.Repo(self.repo_path)
        return self.repo.active_branch.name

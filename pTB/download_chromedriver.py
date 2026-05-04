import os
import sys
import zipfile
import requests
import shutil
import re

def get_chrome_version():
    chrome_paths = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe")
    ]

    for path in chrome_paths:
        if os.path.exists(path):
            try:
                import subprocess
                result = subprocess.run([path, '--version'], capture_output=True, text=True)
                if result.returncode == 0:
                    version_str = result.stdout.strip()
                    match = re.search(r'(\d+)\.', version_str)
                    if match:
                        return match.group(1)
            except Exception:
                pass
    return None

def download_chromedriver():
    chrome_version = get_chrome_version()
    if not chrome_version:
        print("无法获取Chrome版本，请确保Chrome已安装")
        return False

    print(f"检测到Chrome版本: {chrome_version}")

    download_url = f"https://storage.googleapis.com/chrome-for-testing-public/{chrome_version}.0.2625.46/win32/chromedriver-win32.zip"

    print(f"正在下载 ChromeDriver...")

    try:
        print("正在下载...")
        response = requests.get(download_url, timeout=120, stream=True)
        response.raise_for_status()

        download_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "drivers")
        os.makedirs(download_dir, exist_ok=True)

        zip_path = os.path.join(download_dir, "chromedriver.zip")
        with open(zip_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)

        print("正在解压...")
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(download_dir)

        os.remove(zip_path)

        exe_path = os.path.join(download_dir, "chromedriver-win32", "chromedriver.exe")
        final_path = os.path.join(download_dir, "chromedriver.exe")

        if os.path.exists(exe_path):
            if os.path.exists(final_path):
                os.remove(final_path)
            shutil.move(exe_path, final_path)
            shutil.rmtree(os.path.join(download_dir, "chromedriver-win32"))

        print(f"\n✓ ChromeDriver已安装到: {final_path}")

        config_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "config.json")
        driver_path_for_config = final_path.replace("\\", "\\\\")

        print(f"\n配置示例 (添加到 config.json):")
        print(f'"chromedriver_path": "{driver_path_for_config}"')

        return True

    except Exception as e:
        print(f"下载失败: {e}")
        return False

if __name__ == "__main__":
    success = download_chromedriver()
    if success:
        print("\n安装成功！请重新运行爬虫程序")

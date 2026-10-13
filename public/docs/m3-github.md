# How To Maximize GitHub

## Overview

- README
- GitHub Checklist
- Takeaways

## README

### What is a README file?

The README file gives an in-depth description of your project so that other people and your future self can understand your code. It is the first item other users will use to judge your project.

### Introduction

READMEs feel like a tedious afterthought. However, READMEs are a part of good documentation, which is what sets a great project apart. As you read through more and more documentation throughout your career, the difference will become clear. Great documentation makes using a project fantastic, while bad or no documentation makes a package frustrating and limits its use.

### README benefits

- More engagement on your project
- Easier for other people to use your work
- Other developers could get involved in your project and improve it
- Potential hirers will be impressed that you can make a good README file
- Recruiters often don’t actually look at your code. They look at the README, structure and organization, so your README should always be up to date.

### Steps for a good README

While there are no rigid rules for creating a README, here is a general guideline.

**Items to include**

- Title
- Description
- The technology used by the project
- Details about use
- Dependencies

**Title**

The title’s goal is to communicate the goal of the project.

**Description**

The description is the most important part of the README. To describe your project, ask yourself the following questions:

- What is your project?
- Usage examples
- Issues or limitations of the project
- Future features

**Technologies**

- Instructions for installation
- Why did you choose your technology?

**Details about use**

- Contribution guidelines. See [GitHub](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors) for examples
- Credit those who helped with the project
- Which license to use? See [choosealicense.com](https://choosealicense.com/) if you need help deciding

**Dependencies**

- Run `pip freeze` in your terminal
- Filter down the packages to the ones used and copy them into a text file called `requirements.txt`. Add `requirements.txt` to your repository
- Example of a `requirements.txt` file:

```
pandas==2.2.2
scikit-learn==1.5.0
matplotlib==3.9.0
```

### Tips for making it easier to read

- Use a consistent format
- Provide a table of contents if it is long
- Images and GIFs add details, and as they say, a picture is worth 1000 words

**Bonuses for a standout README**

- A picture at the top that is on the theme of the project is a great touch that shows attention to detail
- A YouTube link to a video presentation gives another way for people to access information about your project
- A table of contents makes it easy to find which section the reader is interested in

### Tips for specific roles

**Data Analyst** 👨‍💻👩‍💻

- A video explaining your project is a nice addition, though not necessary for MVP 1

**Data Scientist** 👨‍🔬🧑‍🔬

- A video explaining your project is a nice addition, though not necessary for MVP 1
- Creating and linking a dashboard with your project is a great way to display your project without requiring users to download the necessary files

**Data Engineer** 👷👷‍♀️

- A diagram to show your process is a must for a data engineering project

**ML Engineer** 🤖

- A video explaining your project is a nice addition, though not necessary for MVP 1
- Creating and linking a dashboard with your project is a great way to display your project without requiring users to download the necessary files

### Examples of great READMEs

**Great Data Analyst README** 👨‍💻👩‍💻: [Pro Sports Salary Analysis](https://github.com/JP-Butler/Pro_Sports_Salary_Analysis)

Why was it great?

- A great picture that represents the project accurately
- The video presentation explains the project for viewers who want a video
- The table of contents with links makes information organized and easy to find

**Great Data Scientist README** 👨‍🔬🧑‍🔬: [African Finance Analysis Readme](https://github.com/Davisy/Financial-Inclusion-in-Africa-App/blob/master/README.md?ref=hackernoon.com)

Why was it great?

- It gives a picture to engage the reader
- A link to a dashboard on Streamlit is given, making it easy to access the project without downloading the entire project

**Great Data Engineer README** 👷👷‍♀️: [Real-Time Violence Detection - AWS](https://github.com/Rahul-Vasan/Realtime-Violence-Detection)

Why was it great?

- A great picture that represents the project accurately
- The video presentation explains the project for viewers who want a video
- The table of contents with links makes information organized and easy to find
- A diagram gives an easy way to comprehend the structure of the project

**Great ML Engineer README** 🤖: [Energy Demand Remote Communities](https://github.com/JDandre/energy_demand_remote_communities)

Why was it great?

- The video presentation explains the project for viewers who want a video
- Pictures to show the results make the project professional
- Defining the file structure helps users navigate the GitHub repository

### Template

This template gives a great starting point for making your own project READMEs: [Bonus: Readme Template](https://docs.google.com/document/d/1KKozb_yPAU-CKH_vW0ZCuoQIjKq2NZj6KexxHk3D8ww/edit?usp=sharing)

### README checklist

- Abstract
- Project scope
- How to run the project
  - With the “Open in Colab” button ([openincolab.com](https://openincolab.com/)): (1) copy and paste your repo, (2) generate HTML, (3) copy the HTML where needed
- Dependencies in a `requirements.txt` file
- Folder structure
- Flow diagram
- Remember your audience

## GitHub Checklist

### 1. Complete your profile

It should be the same as LinkedIn.

- Add a picture
- Add a bio: your “sell yourself as a product” summary
- Add job title and company name
- Add your LinkedIn or personal website link

### 2. Add a profile README

This is like a welcome page and can give more details about your skills.

Check out this example: [SalaheddineAD (Salah Eddine Ait Daoud) · GitHub](https://github.com/SalaheddineAD)

**Steps to create a profile README**

1. Press the “+” at the upper right of the page and then press “New repository”.
2. Name the repository your username. A box will appear saying this is a special repository for your GitHub profile.
3. Check off “Add a README file”.
4. Press README.md on your new repository.
5. Paste in a template to start your README, then make edits such as your name, the languages you do and do not know, and other customizations. Select the one for your role:
   - [Data Analyst Readme](https://docs.google.com/document/d/1DxfQ7md92bb6LPmIQrXUmDPbdVWCvC5Lp6BeBOzKcZs/edit)
   - [Data Scientist Readme](https://docs.google.com/document/d/1MRihgjX_cU53Ld_jtiEBXkaPF-5GKGX9c3BbTlbYIYA/edit?usp=sharing)
   - [Data Engineer Readme](https://docs.google.com/document/d/1G2k9Ibn60hezhRZmJLGuLPg8D56pmq0jdij91ohU7FY/edit?usp=sharing)
   - [ML Engineer Readme](https://docs.google.com/document/d/1WlRdJ3LV1ouON03L9foJP7Scg6t41paYObARND7RtXg/edit?usp=sharing)
6. Edit your code. Toggle between “Code” and “Preview” to see how it looks and update as needed.

**How to add more badges**

Here is an extensive [repository of badges](https://github.com/Ileriayo/markdown-badges).

Popular “about you” profile badges:

| What | Appearance | Code to add |
| --- | --- | --- |
| LinkedIn | ![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white) | `![LinkedIn](https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white)` |
| Gmail | ![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white) | `![Gmail](https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white)` |
| LeetCode | ![LeetCode](https://img.shields.io/badge/LeetCode-000000?style=for-the-badge&logo=LeetCode&logoColor=#d16c06) | `![LeetCode](https://img.shields.io/badge/LeetCode-000000?style=for-the-badge&logo=LeetCode&logoColor=#d16c06)` |
| Kaggle | ![Kaggle](https://img.shields.io/badge/Kaggle-035a7d?style=for-the-badge&logo=kaggle&logoColor=white) | `![Kaggle](https://img.shields.io/badge/Kaggle-035a7d?style=for-the-badge&logo=kaggle&logoColor=white)` |
| HackerRank | ![Hackerrank](https://img.shields.io/badge/-Hackerrank-2EC866?style=for-the-badge&logo=HackerRank&logoColor=white) | `![Hackerrank](https://img.shields.io/badge/-Hackerrank-2EC866?style=for-the-badge&logo=HackerRank&logoColor=white)` |
| Portfolio | ![Portfolio](https://img.shields.io/badge/Portfolio-%23000000.svg?style=for-the-badge&logo=firefox&logoColor=#FF7139) | `![Portfolio](https://img.shields.io/badge/Portfolio-%23000000.svg?style=for-the-badge&logo=firefox&logoColor=#FF7139)` |
| Fiverr | ![Fiverr](https://img.shields.io/badge/fiverr-1DBF73?style=for-the-badge&logo=fiverr&logoColor=white) | `![Fiverr](https://img.shields.io/badge/fiverr-1DBF73?style=for-the-badge&logo=fiverr&logoColor=white)` |

Popular coding profile badges:

| What | Appearance | Code to add |
| --- | --- | --- |
| Python | ![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54) | `![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)` |
| R | ![R](https://img.shields.io/badge/r-%23276DC3.svg?style=for-the-badge&logo=r&logoColor=white) | `![R](https://img.shields.io/badge/r-%23276DC3.svg?style=for-the-badge&logo=r&logoColor=white)` |
| C | ![C](https://img.shields.io/badge/c-%2300599C.svg?style=for-the-badge&logo=c&logoColor=white) | `![C](https://img.shields.io/badge/c-%2300599C.svg?style=for-the-badge&logo=c&logoColor=white)` |
| C++ | ![C++](https://img.shields.io/badge/c++-%2300599C.svg?style=for-the-badge&logo=c%2B%2B&logoColor=white) | `![C++](https://img.shields.io/badge/c++-%2300599C.svg?style=for-the-badge&logo=c%2B%2B&logoColor=white)` |
| JavaScript | ![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E) | `![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)` |
| HTML5 | ![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white) | `![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)` |
| CSS3 | ![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white) | `![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)` |

Popular icons:

| What | Appearance | Code to add |
| --- | --- | --- |
| AWS | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg" width="38" height="38" />` |
| Python | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original-wordmark.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original-wordmark.svg" width="38" height="38" />` |
| R | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/r/r-original.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/r/r-original.svg" width="38" height="38" />` |
| Pandas | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pandas/pandas-original-wordmark.svg" width="32" height="32" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pandas/pandas-original-wordmark.svg" width="32" height="32" />` |
| NumPy | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/numpy/numpy-original-wordmark.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/numpy/numpy-original-wordmark.svg" width="38" height="38" />` |
| Scikit-learn | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/scikitlearn/scikitlearn-original.svg" width="38" height="38" />` |
| Streamlit | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/streamlit/streamlit-original-wordmark.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/streamlit/streamlit-original-wordmark.svg" width="38" height="38" />` |
| RStudio | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rstudio/rstudio-original.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rstudio/rstudio-original.svg" width="38" height="38" />` |
| Selenium | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/selenium/selenium-original.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/selenium/selenium-original.svg" width="38" height="38" />` |
| TensorFlow | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tensorflow/tensorflow-original.svg" width="38" height="38" />` |
| Hadoop | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/hadoop/hadoop-original-wordmark.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/hadoop/hadoop-original-wordmark.svg" width="38" height="38" />` |
| Google Cloud | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/googlecloud/googlecloud-original.svg" width="38" height="38" />` |
| Kubernetes | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-plain.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/kubernetes/kubernetes-plain.svg" width="38" height="38" />` |
| OpenCV | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/opencv/opencv-original-wordmark.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/opencv/opencv-original-wordmark.svg" width="38" height="38" />` |
| MySQL | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original-wordmark.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original-wordmark.svg" width="38" height="38" />` |
| SQLite | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original-wordmark.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sqlite/sqlite-original-wordmark.svg" width="38" height="38" />` |
| PostgreSQL | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original-wordmark.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original-wordmark.svg" width="38" height="38" />` |
| PyTorch | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original-wordmark.svg" width="38" height="38" /> | `<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original-wordmark.svg" width="38" height="38" />` |

Great site for more icons: [devicon.dev](https://devicon.dev/)

**Animations to add**

Adding this line to your README:

```
![Description](https://user-images.githubusercontent.com/74038190/236119160-976a0405-caa7-470c-9356-16d43402ea0a.gif)
```

will give this fun animation:

![Description](https://user-images.githubusercontent.com/74038190/236119160-976a0405-caa7-470c-9356-16d43402ea0a.gif)

Another example:

![Description](https://user-images.githubusercontent.com/74038190/221352987-68da234d-4d62-4e9d-9d7f-098dc657c2dc.gif)

Here is a repository of fun animations: [Cool GIFs for GitHub](https://github.com/Anmol-Baranwal/Cool-GIFs-For-GitHub?tab=readme-ov-file)

**Stats cards**

![Most Used Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=SalahEddineAD&layout=compact)

![GitHub Stats](https://github-readme-stats.vercel.app/api?username=SalahEddineAD&show_icons=true)

**More inspiration**

If you want more creative profiles for inspiration, this GitHub repo is perfect: [coderjojo/creative-profile-readme](https://github.com/coderjojo/creative-profile-readme)

### 3. Pin the projects you want others to see

Pin your “best” or “most impressive” projects.

### 4. Document your projects (repos)

- README (very important, see the README section above)
- Markdown
  - **Tip:** In my last year of school I took all my notes in Markdown so I could practice using it. It is very important in data science because it helps developers, data scientists and non-technical people understand what the code does.
- Inference: being able to write what the data or model does, and what you obtained from the experiment, app or project
- Understanding of the model under the hood
- Understanding what the metrics mean
- Understanding each feature in your project
- Project description

**Note:** The longer you have been working on a project the better it looks, as it shows commitment, grit and determination.

## Takeaways

You should now have:

- All your projects added to GitHub
  - School or academic projects
  - Course projects
  - Fun or side projects
  - Competition projects
  - Guided projects
- A README for each project
- A description for each project
- Your top 6 projects pinned to the home page
- A welcome (profile) README

Next: [Maximize Portfolio (website)](view.html?doc=m3-portfolio.md)

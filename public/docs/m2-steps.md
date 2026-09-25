# Project Step-By-Step

**IMPORTANT: Review this doc before the call and do it after the call - **If you haven’t had your initial project (module 2) planning meeting to discuss your project idea, then you can use this lesson as a rough overview, and you will go through it again when working on your project.
# Overview

- To Remember
- MVPs
- Quick n Dirty
- Intro
- MVP 1: End-to-End Data Project Example
- MVP 2: Level Up
- MVP 3: Intermediate
- MVPs Per Data Role

# To Remember

While these steps can seem tedious, they are essential we do them fully:

- Readme first** - It takes 12 seconds to make a first impression, this will be the first thing recruiters and hiring managers see, and they might not even see your code
- Always MVP**
- If you don’t have data, you don't have a project**
## **Use the **cookie cutter structure** from Github (**[00 - Coding- Cookiecutter Data-Science Project Structure](https://docs.google.com/document/d/1PGYcNkDchiy_piS0xwT7wsf1GORUsUR3Rkii8vbc_UE/edit#heading=h.c9pbecihgfr2)**)**

## **Invite elliotastern to the project on **Github

# **MVPs**

## Assumptions

- All phases assume you have an idea, project scope, some data, and the worksheet completed
- At the end of each phase, you have a readme that explains any knowledge you gained and the steps taken. You can think of this as a project summary to hand in. TIP: If you do it before the work, it gives you a step-by-step plan.

# Quick n Dirty

When you start, the goal is to quickly investigate to see if the data will work for this project.

- Download the data and get to playing with the data to understand it
- Notebook - Don’t worry about the setup of env or IDE (although highly suggested), whatever you are most comfortable with.
- Readme **- In this phase, the Readme will be the first markdown cell in the notebook
  - Project Scope
  - Context or background info
  - Visualizations of what the data looks like
  - Author
  - Data sources
  - Dependencies Section
# Intro

For your project, we will use a previous mentee’s project as our ***example project**** *to help guide you:

The example project predicts which sections of water pipes are at high risk of breaking

If this example feels difficult or you want to review a simple project, here is a less complex housing price project: [BONUS: Simple Housing Example for ML Intuition](https://docs.google.com/document/d/1QC4FLcqLeBZGAfT6IWWZEDPpEI49yjc6QoUd4e5LPIk/edit)

# **MVP 1: End-to-End Data Project Example**

Timeline based on 10 - 20 hours per week
—------------------------------------------------------------------------------------------------------------------
## **Step 1: **Data Collection & Storage (~ 1-3 weeks)

**Description:** Data collection is self-explanatory as this is the part of the process where we collect the data for our project.
**Directions for all projects:**
- Remember Sample Size:** We want to ensure a sufficient sample size when we collect data. For a regression problem, 50 is the minimum amount of samples we want. For a classification problem, we want to ensure we have enough 20 samples for each class. For example, if we were predicting if credit card payments are fraud or not fraud, and 99% of the data is not fraud, we would need 20+ samples of fraud, which would require 2,000 samples.
**Directions based on project type:**
- For **Data Analysts ****👨‍💻👩‍💻****: **Get CSV of a data set (if the dataset exists, if not go MVP 2)
- For **Data Engineers ****👷👷‍♀️****:** Data engineering requires multiple (2-3+) data sources. Merging different types of data is a plus—for example, both an API and web scraping.
  - For web scraping projects, read this guide:[01 Data Collection- General Scraping Guide](https://docs.google.com/document/d/1K8O9qDXRUCMTcxSFThJedNYnudmD_Ik7-WcL5NDKiMc/edit?usp=sharing)
- For API projects, read this [API Tutorial](https://realpython.com/python-api/).
  - Definition of an API:
  - An API is a way for two computer programs to talk to each other.
- For** Data Scientists ****👨‍🔬🧑‍🔬****  and Machine Learning Engineers ****🤖****: **Collect data with API(s) and/or with web scraping
- For web scraping projects, read this guide:[01 Data Collection- General Scraping Guide](https://docs.google.com/document/d/1K8O9qDXRUCMTcxSFThJedNYnudmD_Ik7-WcL5NDKiMc/edit?usp=sharing)
- For API projects, read this [API Tutorial](https://realpython.com/python-api/).
  - Definition of an API:
  - An API is a way for two computer programs to talk to each other.
**Example Project (Water Main Breaks) for Data Collecting for downloading off a website:**
Downloaded from the site: [https://open-kitchenergis.opendata.arcgis.com/datasets/KitchenerGIS::water-main-breaks/about](https://open-kitchenergis.opendata.arcgis.com/datasets/KitchenerGIS::water-main-breaks/about)

**Example Project (Bachelorette) finding a dataset on Kaggle:**
[DA Bachelorette: 1 Get Data](https://docs.google.com/document/d/1EVHnysrMk34QMEYl_rXC87uSW0aKGrLbZB0z3AXJsko/edit?usp=sharing)

—------------------------------------------------------------------------------------------------------------------
## **Step 2: Data Cleaning **(~ 1-2 weeks)

**Description:** Data cleaning is cleaning our data to be easily analyzed, graphed, modeled, or any other calculation we wish to do.

Example dataset:

Unclean dataset with inconsistent formats in the Population column

| City | Population |
| --- | --- |
| New York | 8400000 |
| Los Angeles | “3.9M” |

Cleaned dataset with the string “3.9M” cleaned to a numeric of 3900000

| City | Population |
| --- | --- |
| New York | 8400000 |
| Los Angeles | 3900000 |

**Directions**:
Here are each of the steps to clean your data:

**Directions for all projects:**
### **SQL Steps:**

**Step 2.1: **
- [The Ultimate Guide to Data Cleaning in SQL | Acho](https://acho.io/blogs/the-ultimate-guide-to-data-cleaning-in-sql)
### **Python Steps:**

**Step 2.1: **Reshape data (if the data is the wrong shape)
- Wide to Long**
- [Pandas Melt, Stack and wide_to_long For Reshaping Columns into Rows](https://towardsdatascience.com/wide-to-long-data-how-and-when-to-use-pandas-melt-stack-and-wide-to-long-7c1e0f462a98)
- [Reshape Wide DataFrame to Tidy with identifiers using Pandas Melt - GeeksforGeeks](https://www.geeksforgeeks.org/reshape-wide-dataframe-to-tidy-with-identifiers-using-pandas-melt/)
- [Reshaping Data with pandas Course | DataCamp](https://www.datacamp.com/courses/reshaping-data-with-pandas) (Paid)
- Transpose (flip a dataframe)**
- [Pandas DataFrame transpose() Method: Swap Rows and Columns](https://www.geeksforgeeks.org/python-pandas-dataframe-transpose/)
**Step 2.2: ** Join the data (if there is more than 1 data frame)
- [01 Data Cleaning- Steps for Joining Data](https://docs.google.com/document/d/1u8oXkX6Q_mTAJWzwqLZrigBp693RGLSwkzmOB591bZg/edit?usp=sharing)
- [Python Article](https://realpython.com/pandas-merge-join-and-concat/)
- [Joining DataFrames in pandas Tutorial | DataCamp](https://www.datacamp.com/tutorial/joining-dataframes-pandas)
- [Python | Pandas Merging, Joining, and Concatenating - GeeksforGeeks](https://www.geeksforgeeks.org/python-pandas-merging-joining-and-concatenating/)
- [Datacamp Python Data Joining Course (Paid)](https://www.datacamp.com/courses/joining-data-with-pandas?utm_source=google&utm_medium=paid_search&utm_campaignid=1565261270&utm_adgroupid=151092705311&utm_device=c&utm_keyword=&utm_matchtype=&utm_network=g&utm_adpostion=&utm_creative=661435091895&utm_targetid=dsa-2220136287253&utm_loc_interest_ms=&utm_loc_physical_ms=9032829&utm_content=dsa~generic~courses~python&utm_campaign=220808_1-sea~dsa~generic_2-b2c_3-us_4-prc_5-na_6-na_7-le_8-pdsh-go_9-na_10-na_11-na&gad_source=1&gclid=Cj0KCQiA5-uuBhDzARIsAAa21T9L2zb16NvSElytQJy2aF0JxBg-246-mtINfKQYfdxgVIwDeDVcyfYaAihPEALw_wcB)
**Step 2.3: **Clean Missing Values
- [02 - Data Cleaning- Dealing with Missing Values](https://docs.google.com/document/d/1yS_cPmbbSnKZ_WssGEmAH96niZHUPZsZPpGBBACd2q0/edit)
- Example Project (Water Main Break) **Data Cleaning Missing Values
  - [Notebook Breakdown Link](https://docs.google.com/document/d/1fHpRNScCkbu5X2dNaDOKPFHil3eBPmS_HTWW0MmUD0o/edit?usp=sharing)
  - [Notebook Link](https://github.com/js3lliott/water-main-break-prediction-KW/blob/main/notebooks/01_initial_preprocessing.ipynb)
- Example Project (Bachelorette) **Data Cleaning Missing Values
  - [Notebook Breakdown Link](https://docs.google.com/document/d/12OTEORaK5HzcHiqxjtTJQWs1W6mhwrI9gvx9DS7xItk/edit?usp=sharing)
  - [Notebook Link](https://github.com/vlventure/Bachelor_Contestants/blob/main/Bachelor_Data_Final_2021.ipynb)
**Step 2.4: **Cleaning Formats (dates, encoding, trailing, and leading spaces)
- [Clean Formats Tutorial](https://www.w3schools.com/python/pandas/pandas_cleaning_wrong_format.asp)
- Example Project (Water Main Breaks):**
  - [Notebook Breakdown Link](https://docs.google.com/document/d/1EVofxcmiiethUJET-TJv-E1puwm5bvhDX5TVlt9SdrM/edit?usp=sharing)
  - [Notebook Link](https://github.com/js3lliott/water-main-break-prediction-KW/blob/main/notebooks/01_initial_preprocessing.ipynb)
- Example Project (Bachelorette) **Data Cleaning Missing Values
  - [Notebook Breakdown Link](https://docs.google.com/document/d/1-rccnr1XcjRL1iZXUrkFbeMfnP5Aa5T6dPXAxWU7nXk/edit?usp=sharing)
  - [Notebook Link](https://github.com/vlventure/Bachelor_Contestants/blob/main/Bachelor_Data_Final_2021.ipynb)
**Step 2.5: **Clean Duplicate Values (if any exist)
- [Removing Duplicates Tutorial](https://www.w3schools.com/python/pandas/pandas_cleaning_duplicates.asp)
**Step 2.6: **Standardizing, Normalizing (not necessary for all projects)
- [Normalization, Standardization Tutorial](https://www.geeksforgeeks.org/ml-feature-scaling-part-2/)
- Example Project (Water Main Breaks):**
  - [Notebook Breakdown Link](https://docs.google.com/document/d/1jTQM5avm-CA6hF9Vl-tUGnVX7mHRPPf72GPZ5Z1IqlU/edit?usp=sharing)
  - [Notebook Link](https://github.com/js3lliott/water-main-break-prediction-KW/blob/main/notebooks/03_feature_eng_preprocessing.ipynb)
**Step 2.7: **1-Hot Encoding
- [One Hot Encoding Tutorial](https://www.geeksforgeeks.org/ml-one-hot-encoding-of-datasets-in-python/)
- Example Project (Water Main Breaks):**
  - [Notebook Breakdown Link](https://docs.google.com/document/d/1z53YDUzJH_8wA9eZBiYbWC0B_h5bxBlsyWIhtKOAShc/edit?usp=sharing)
  - [Notebook Link](https://github.com/js3lliott/water-main-break-prediction-KW/blob/main/notebooks/03_feature_eng_preprocessing.ipynb)

For more practice, check out [Datacamp Data Cleaning Paid Course](https://app.datacamp.com/learn/courses/cleaning-data-in-python)
**Directions for Data Engineers ****👷👷‍♀️**
- Use Python, not sql for data cleaning
- Store in a local db (nosql or sql)
—------------------------------------------------------------------------------------------------------------------
## **Step 3: Exploratory data analysis (EDA) **( ~ 1 week)

**Description:** Exploratory Data Analysis (EDA) is the process of investigating data to uncover its main characteristics and patterns using statistical techniques and visualization tools. We want to display that we can use each of the major graphing libraries, Matplotlib, Seaborn, and Plotly to employers to show our robust skillset.

**Directions for all projects:**

**Step 3.1: **Visualization Tips:
- Read these tips for your graphs: [03 - Data Visualization- Tips](https://docs.google.com/document/d/13m02UJUIMwVP03LbBXlA7DjkEQ4D3BobKdgFnXxzr3g/edit?usp=sharing)

**Directions for Data Scientists ****👨‍🔬🧑‍🔬****, Machine Learning Engineers ****🤖****, and some Data Analysts ****👨‍💻👩‍💻:**
**Step 3.2: **Graphing (Use each 1+ of each graph with 7+ in total):
- Matplotlib
  - [Matplotlib Documentation](https://matplotlib.org/stable/tutorials/introductory/quick_start.html)
- Seaborn
  - [Seaborn Documentation](https://seaborn.pydata.org/tutorial.html)
- Plotly
  - [Plotly Documentation](https://plotly.com/python/getting-started/)
- Example Project (Water Main Breaks):**
  - [Notebook Breakdown Link](https://docs.google.com/document/d/1z53YDUzJH_8wA9eZBiYbWC0B_h5bxBlsyWIhtKOAShc/edit?usp=sharing)
  - [Notebook Link](https://github.com/js3lliott/water-main-break-prediction-KW/blob/main/notebooks/03_feature_eng_preprocessing.ipynb)

- Example Project (Bachelorette) **Data Cleaning Missing Values
  - [Notebook Breakdown Link](https://docs.google.com/document/d/1DXCOPaLZ8SidU_wB1kTJZzNowsrZTPLAOPGrqU74oU0/edit?usp=sharing)
  - [Notebook Link](https://github.com/vlventure/Bachelor_Contestants/blob/main/Bachelor_Data_Final_2021.ipynb)

**Directions for Data Engineers ****👷👷‍♀️:**
- Use Tableau or Power BI
—------------------------------------------------------------------------------------------------------------------
## **Step 4: Model Building** (~ 3 weeks)

*Data analysts ***👨‍💻👩‍💻 ***and **Data Engineers ***👷👷‍♀️***can skip this section if they are not building a model.*

**Description:** In the data science process, Model Building is the step where we create a machine learning model to predict or classify outcomes based on input data. This involves the selection of an appropriate algorithm that fits the problem at hand, training this algorithm using a dataset, and then evaluating the model's performance using a separate test set. This cycle of training and evaluation is repeated, with tweaks made to the model parameters until it achieves a desirable level of accuracy, making it ready for deployment in real-world situations.
**Directions:**
**Step 4.1**: Feature Engineering (~ 1 week)
- Why feature engineering?
  - Properly engineered features can significantly enhance machine learning algorithms' predictive performance by highlighting the data's underlying patterns. While feature engineering is often overlooked as another step in the data science process, it is often the key to having a top-performing algorithm. This can be seen in Kaggle, where 1000s of top data scientists compete to create the most accurate algorithm. While data scientists with less experience with algorithms often assume that perfectly tuned state-of-the-art algorithm is the key to winning these competitions, it is usually excellent feature engineering that sets apart the winning algorithm. For example, in a used car price prediction competition, it was creating a new feature for the more stand-out colors, such as red, versus the more bland colors such as grey, black, and white, which turned out to be the critical feature for the most accurate algorithm. This is why showing that you can do well-thought-out feature engineering is a key separator of what makes a great data scientist.
- Read this quick tutorial to get an introduction to feature engineering: [Feature Engineering Methods Tutorial](https://www.kaggle.com/code/prashant111/a-reference-guide-to-feature-engineering-methods/notebook)
- For a deeper dive into feature engineering to improve the project, check out this course (For MVP 2+): [Learn Feature Engineering Course](https://www.kaggle.com/learn/feature-engineering)

- Example Project (Water Main Breaks):**
  - [Notebook Breakdown Link](https://docs.google.com/document/d/1tUkqhRt_aFHmbb2ktBInubPXZ_gmZUdS2IxkfnycHLU/edit)
  - [Notebook Link](https://github.com/js3lliott/water-main-break-prediction-KW/blob/main/notebooks/03_feature_eng_preprocessing.ipynb)
**Step 4.2**: Feature and Target Variable Selection (~ 0-1 week)
- Read this tutorial for an introduction to feature selection: [Feature Selection Techniques Tutorial](https://www.analyticsvidhya.com/blog/2020/10/feature-selection-techniques-in-machine-learning/)
- [How to pick your Target Variables?](https://docs.google.com/document/d/1lxiMNyamAOE69GSBZb1A6RBwhdWq4JDv5GnO2Zb_h8I/edit)
**Step 4.3:** Pick 3 Algorithms, Create 1 Null Model and do Model Evaluation (~ 1-2 weeks)
- Guide for choosing your 3 algorithms as well as how to run the algorithms and compare results:
- [BONUS: Model Evaluation Metrics](https://docs.google.com/document/d/11KpMu8ggR2oQxt_O7fgqsP5foiROq8Hit9ro0pbKSOw/edit?usp=sharing)
- Example Project (Water Main Breaks):**
  - [Notebook Breakdown Link](https://docs.google.com/document/d/1tUkqhRt_aFHmbb2ktBInubPXZ_gmZUdS2IxkfnycHLU/edit)
  - [Notebook Link](https://github.com/js3lliott/water-main-break-prediction-KW/blob/main/notebooks/05_baseline_model.ipynb)
**Step 4.4**: Hyper-Parameter Tuning** ** (~ 0-1 weeks)
- Tune the most accurate of the 3 algorithms as described in this [Tuning Tutorial](https://www.analyticsvidhya.com/blog/2022/02/a-comprehensive-guide-on-hyperparameter-tuning-and-its-techniques/)
—------------------------------------------------------------------------------------------------------------------
**Step 5: Deploy the Model **(~ 2-3 weeks)
*Data analysts ***👨‍💻👩‍💻 ***and Data Engineers ***👷👷‍♀️***can skip this section if they are not building a model.*

**Directions:**
**Step 5.1 ****: **Create an Updating Dashboard
- Follow this guide:  [BONUS: Creating an Updating Dashboard](https://docs.google.com/document/d/1LF0Kce_i23ayRgQEkgoI-RW__EaYudcLP_RhgfYGYTw/edit?usp=sharing)
**Step 5.2:** Conclusions and Documentation (~ 1 week)
- Create documentation, create your Github, post on a website [05 - How To Maximize Portfolio - Checklist](https://docs.google.com/document/d/1f83bDSRjLRDBPOyFt_3XsG1glgR05Qt1VwFx9L9ke84/edit#heading=h.s1j4hxx1s59)

# MVP 2: Level Up

## Step 1: Data Collection & Storage

Options:
For Data analysts 👨‍💻👩‍💻:
- If you are already using web scraping, you are done with this step
- If you are already using an API, you are done with this step
If you don’t have web scraping or an API, do 1 of the following:
- Add your data to a database
  - Move your data frame to a local database (popular databases for data science include SQLite, PostgreSQL, and MySQL)
- If you only use csvs, add a script to download csv
  - Guide: [01 - Data Collection- General Scraping Guide](https://docs.google.com/document/d/1K8O9qDXRUCMTcxSFThJedNYnudmD_Ik7-WcL5NDKiMc/edit)
- Combine data by adding web scraping or an API
  - Guide: [01 - Data Collection- General Scraping Guide](https://docs.google.com/document/d/1K8O9qDXRUCMTcxSFThJedNYnudmD_Ik7-WcL5NDKiMc/edit)
  - Tutorial:  [API Tutorial](https://realpython.com/python-api/).
  - Definition of an API: An API is a way for two computer programs to talk to each other.
**Step 2: Implementation**
For Data Engineers**👷👷‍♀️**, Data Scientists👨‍🔬🧑‍🔬,and Machine Learning Engineers 🤖 :
- Functional Programming
  - Guide: [BONUS: Functional Programming](https://docs.google.com/document/d/1OUCkIRdP_gpZ4QNpptWUgMadwQG4doioPB4O3K-O2vo/edit?usp=sharing)
For Data Scientists👨‍💻👩‍💻, and Machine Learning Engineers 🤖 :
- Experiment Tracking
  - Guide: [BONUS: Experiment Tracking](https://docs.google.com/document/d/1w4a1XNoLxLcTNaLQPBxAlXRVGwzzu9-Nsov3IZhlpGw/edit?usp=sharing)

## Step 3: Deployment

For Machine Learning Engineers🤖:
- Containerization
  - Guide: [BONUS: Containerization](https://docs.google.com/document/d/1_p2JVA2qA2xoQhfeogSnI5ycRZNg5Fe6-wOSb1So_Nk/edit?usp=sharing)

## Step 4: Marketing & UX Progression

Linkedin Feature Section:
- Add to the LinkedIn feature section
- Add to Resume
- System Flow Diagram (ie data => cleaning => tools => output)
- Content about the project (ie learning, sharing, skills, teaching)
- Short README overview (talk through the whole project in writing)
- Add the link to the project's GitHub or website
- (Optional - recommended) Create a post about it, a great example is an **Example by **[Mireille Nehme](https://www.linkedin.com/in/mireille-nehme?miniProfileUrn=urn%3Ali%3Afs_miniProfile%3AACoAAAtt7eIBAtbgajMhZBXw195zNPJBECaVRZU&lipi=urn%3Ali%3Apage%3Ad_flagship3_detail_base%3BaQFbOIRhQ6evEAY3oVebkQ%3D%3D) ([View Post Here](https://www.linkedin.com/posts/mireille-nehme_careerdevelopment-datascience-dataanalysis-activity-7090684832908804096-vegn?utm_source=share&utm_medium=member_desktop)) - You can learn more information about connect in [module 3 Content Creation doc](https://docs.google.com/document/d/1Ni3wlGlOfnjbH9es_mQ1uvRDMbulZdy96LPJto41YXw/edit?usp=sharing)
—------------------------------------------------------------------------------------------------------------------
# MVP 3: Intermediate

## **Step 1: **Data Collection & Storage

For Data analysts 👨‍💻👩‍💻:
- If you are already using web scraping, you are done with this step
- If you are already using an API, you are done with this step
For Data Engineers**👷👷‍♀️, **Data Scientists 👨‍🔬🧑‍🔬,** ** and Machine Learning Engineers:
- Create DB and store data in DB

## Step 2: Implementation

For Data Engineers**👷👷‍♀️ ** and Machine Learning Engineers:
- Object Oriented Programming:
  - Guide: [BONUS: Object Oriented Programming](https://docs.google.com/document/d/103RAIfLSkKbxgshj3HsAWcySE_z9275yHFwq4tghRGE/edit?usp=sharing)
  - More reading:
  - [Object oriented programming for Data Science | Kaggle](https://www.kaggle.com/code/alaasedeeq/object-oriented-programming-for-data-science)
  - [Object-Oriented Programming Explained Simply for Data Scientists - KDnuggets](https://www.kdnuggets.com/2020/12/object-oriented-programming-explained-simply-data-scientists.html)
- Modular Programming
  - Guide: [00 Coding- Modular Programming](https://docs.google.com/document/d/1AkmF0O5wCSxgo73GRaUOn09lKqvDtw1wx5JfH6cwL8Y/edit?usp=sharing)

## Step 3: Deployment

For Data Analysts**👨‍💻👩‍💻**:
- Create an Updating Dashboard
  - Follow this Guide:  [05 Data Visualization- Creating an Updating Dashboard](https://docs.google.com/document/d/1LF0Kce_i23ayRgQEkgoI-RW__EaYudcLP_RhgfYGYTw/edit?usp=sharing)
For Data Scientists 👨‍🔬🧑‍🔬 :
- Containerization
  - Follow this Guide: [BONUS: Containerization](https://docs.google.com/document/d/1_p2JVA2qA2xoQhfeogSnI5ycRZNg5Fe6-wOSb1So_Nk/edit?usp=sharing)

For ML Engineers:
- CICD (GitHub Actions)
  - Follow this Guide: [BONUS: CICD](https://docs.google.com/document/d/1HbgeXrtgjwR_QU2UzhegBUdzOYfX6Bebdu44HBXMUjc/edit?usp=sharing)
- Microservices
  - Follow this Guide: [BONUS: Microservices](https://docs.google.com/document/d/1oHhsXVeKmD5rBSx4wrQJRPya-B4Vedpug8zPybfxmfc/edit)
  - More reading: [A Data Scientist’s Introduction to Microservices | by Chetana Didugu](https://towardsdatascience.com/a-data-scientists-introduction-to-microservices-7772d356fe4d)

## Step 4: Marketing & UX Progression

- LinkedIn Post/content
- Website/hosted
- Business Report - [View this lesson](https://docs.google.com/document/d/14AIKrhb7kVAzQePrRKOCcgm92hx4oiIUHwQOCY_vXcE/edit?usp=sharing) to create one

—------------------------------------------------------------------------------------------------------------------
# MVPs Per Data Role

## High-Level MVP Per Data Role Table

We will have a high-level table for you to review with more details explaining each MVP per the 4 main roles in Data Analyst, Data Engineer **👷👷‍♀️ **, Data Scientist​​👨‍🔬🧑‍🔬  , Machine Learning Engineers 🤖

|  | Data Analyst; 👨‍💻👩‍💻 | Data Engineer; 👷👷‍♀️ | Data Scientist; 👨‍🔬🧑‍🔬 | Machine Learning Engineer 🤖 |
| --- | --- | --- | --- | --- |
| MVP 1 | Data Collection & Storage: ; Manual download (ie CSV, images, etc); ; Implementation: ; Notebooks; ; Deployment: ; ; ; Marketing & UX; Basic information with; Tableau or Power BI; ; | Data Collection & Storage: ; Manual download (ie CSV, images, etc); ; Implementation: ; Organized Notebooks; ; Deployment: ; Local (Storage); ; Marketing & UX ; Basic information with; Tableau or Power BI; ; | Data Collection & Storage: ; Manual download (ie CSV, images, etc); ; Implementation:; Notebooks; ; ; Deployment:; Local (Endpoint); ; Marketing & UX ; Basic information | Data Collection & Storage:; Manual download (ie CSV, images, etc); ; Implementation:; Organized Notebooks ; ; Deployment:; Local (Endpoint & Storage); ; Marketing & UX: ; Basic information |
| MVP 2 | Data Collection & Storage: ; Automation; Automation to Local DB; ; ; Implementation: ; ; ; Deployment: ; ; Marketing & UX: ; Story; ; | Data Collection & Storage:; Automation with; Multiple data sources; ; Implementation: ; Scripts; ; Deployment: ; Hosted (Storage); ; Marketing & UX: ; Story; | Data Collection & Storage:; Automation; ; Implementation:; Organized Notebooks; ; Deployment:; Hosted (Model); ; Marketing & UX: ; Story; | Data Collection & Storage:; Automation; ; Implementation:; Scripts; ; Deployment:; Hosted (Storage & Model); ; Marketing & UX: ; Story |
| MVP 3 | Data Collection & Storage: ; Automation to Local DB; ; Implementation: ; ; ; Deployment:; Hosted Dashboard; ; Marketing & UX: ; Presentation | Data Collection & Storage:; Automation to hosted DB; ; Implementation: ; Modular Programming; ; Deployment: ; Scalable (DataOps & DevOps); ; Marketing & UX: ; Presentation; | Data Collection & Storage: ; Automation to Local DB; ; Implementation:; Scripts; ; Deployment:; Production; ; Marketing & UX: ; Presentation; | Data Collection & Storage:; Automation to DB (Local); ; Implementation: ; Modular Programming; ; Deployment: ; Production; ; Marketing & UX: ; Presentation |
| MVP 4 | Data Collection & Storage:; Automation to hosted DB; ; Implementation:; web dev frameworks; Pipeline (ETL); ; Deployment:; ; Marketing & UX ; Public; | Data Collection & Storage:; Automation (optimized) to hosted DB ; ; Implementation: ; Application; ; Deployment: ; ; ; Marketing & UX ; Public | Data Collection & Storage:; Automation to hosted DB; ; Implementation:; Modular Programming; ; Deployment:; Scalable (MLOps); ; Marketing & UX ; Public | Data Collection & Storage:; Automation to hosted DB; ; Implementation: ; Application; ; Deployment: ; Scalable (MLOps); ; Marketing & UX ; Public |
| MVP 5 | Data Collection & Storage:; Automation in Cloud; ; Implementation:; ; Deployment:; ; Marketing & UX ; Personal Brand; | Data Collection & Storage:; Automation in Cloud; ; Implementation:; Product; ; Deployment:; Cloud hosted; ; Marketing & UX ; Personal Brand | Data Collection & Storage:; Automation in Cloud; ; Implementation: ; Application; ; Deployment: ; Cloud hosted; ; Marketing & UX ; Personal Brand | Data Collection & Storage:; Automation in Cloud; ; Implementation: ; Product; ; Deployment: ; Cloud hosted; ; Marketing & UX ; Personal Brand |

## Data Collection & Storage Progression

Back to Table
- Manual download (ie CSV, images, etc.)
- Automation
  - web scraping, manually call API, and/or script to download csv
- Automation to local DB (Manually triggered)
  - Setup local DB
- Automation to hosted DB
  - Setup hosted DB
- Automation (optimized) to hosted DB - (Mainly DE, stand out for other roles)
  - Workflows - scheduled or triggered (ie Airflow)
  - Optimized API - don’t always get full dataset (Good practice)
  - Only update new cells (Good practice)
  - Datasets are versioned
- Automation in Cloud (GCP, Azure, AWS)

## Implementation Progression

Back to Table
- Notebooks
  - Cookie cutter
  - Start learning [BONUS: Clean Python code](https://docs.google.com/document/d/1RdsgmdO0CFamrP9bn09Dp0JmrWVhezfYyGXI6NJ28qc/edit?usp=sharing)
  - ML Implementation - DS, MLE
  - ML results saved in a CSV
- Organized Notebooks
  - functional programming
  - IDE
  - [BONUS: Clean Python code](https://docs.google.com/document/d/1RdsgmdO0CFamrP9bn09Dp0JmrWVhezfYyGXI6NJ28qc/edit?usp=sharing)
  - In between Markdown - documentation, inference
  - ML Implementation - DS, MLE
  - Model Explainability
  - Experiment Tracking
- Scripts
  - Envs
  - Workflows (ie Airflow) - DE, DS, MLE
  - Readme explaining different scripts
- Modular Programming
  - __init__.py
  - Run on local machine
- Application - DE, DS, MLE
  - Object Oriented Programming
  - Packaged & Versioned
  - Containerization - Isolated, reusable, shareable
  - Reproducibility - Run on any machine
- Product - DE, DS, MLE
  - Unit Testing / Test Driven Developement (TDD)
  - Packaged & Published

## ML Deployment Progression - DE, DS, MLE

Back to Table
- Local
  - Endpoint - DS, MLE
  - Storage - DE, DS, MLE
- Hosted
  - App or endpoint (ie Streamlit)
- Production
  - Reproducibility - Run on any machine
  - Microservers
  - Manual Deployment
- Scalable - MLOps
  - DataOps **- Automation and storage of all data-related activities (Collecting, cleaning, ETL, feature engineering, etc) - DE, DS, MLE
  - Feature store
  - Metadata store
  - Artifact Store
  - Model Registry
  - DevOps **- These are practices and tools to produce fast - DE, DS, MLE
  - high-quality software
  - Logging - Errors, traceback. Successes, requests, etc
  - Continuous Integration** (CI) - validates and tests code automatically (ie GitHub actions
  - Continuous Deployment** (CD) - Deploys if pass all checks automatically (ie GitHub actions)
  - Orchestrations (ie Kubernetes)
  - ModelOps **-  An automated method of going from experiment to production - DS or MLE
  - Continuous Training (CT)** - Models in experiments that are accepted should be automatically passed and trained seamlessly to pass to production automatically
  - Continuous Monitoring (CM)** - When the model is in production
- Cloud Hosted - **under construction******

## Marketing & UI/UX Progression

Back to Table

- Basic information
  - Readme
  - GitHub
  - Inline visualizations
- Story
  - Add to LinkedIn feature section
  - Add to Resume
  - System Flow Diagram (ie data => cleaning => tools => output) (View: : [BONUS: Creating a Compelling Business Report](https://docs.google.com/document/d/14AIKrhb7kVAzQePrRKOCcgm92hx4oiIUHwQOCY_vXcE/edit?usp=drive_link))
  - Content about the project (ie learning, sharing, skills, teaching)
  - Short README overview (talk through the whole project in writing)
- Presentation
  - Local UI (Live data & Interactive) - DE, DS, MLE
  - Local Dashboard (Live data & Interactive) - DA
  - Business Report (View: [BONUS: Creating a Compelling Business Report](https://docs.google.com/document/d/14AIKrhb7kVAzQePrRKOCcgm92hx4oiIUHwQOCY_vXcE/edit?usp=drive_link))
  - Screenshots and GIF in readme
- Public
  - Hosted UI Website with Dashboard (Live data & Interactive) - DE, DS, MLE
  - Hosted Dashboard (Live data & Interactive) - DA
  - Blog/Article
  - Video Presentation - ie post it on youtube, LinkedIn, GitHub
- Personal Brand
  - Content System
  - Written Content - Break up your project into 20+ pieces of content
  - Video Content - Break up your project into 20+ pieces of content

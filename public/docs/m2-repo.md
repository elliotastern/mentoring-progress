# Cookiecutter Data-Science Project Structure

# Why?

- Organization is vital in coding. This may be less apparent with a small project, but as the project grows, organization prevents significant time loss from looking for information and lowering the time to maintain your code.
- Hirers and other coders want to work with organized, clean coders so that they do not can easily understand your work.
- You can read more about it here [Home - Cookiecutter Data Science](http://drivendata.github.io/cookiecutter-data-science/).

# How to use it

You can use the Cookiecutter Structure by downloading the repo and copying and pasting the structure to your project. You can do this locally or remotely; locally is easier as you can click and drag. The industry standard for building off a current project is by forking it (not suggested).
[https://github.com/drivendata/cookiecutter-data-science](https://github.com/drivendata/cookiecutter-data-science)

# Cookiecutter Structure

**Fork and Clone Github**

Link to our [Example Project Github](https://github.com/js3lliott/water-main-break-prediction-KW/tree/main) **example** using the Cookiecutter Data-Science Project Structure:

The README.md file introduces our project and is the introduction to our project

The example project splits up the code into 5 Notebooks and puts them in the “notebooks” folder:

The example project saves an advanced graph in the figures folder:

All of our data is saved in our 3 data folders.
- The “raw” folder stores our original data, our 3 CSVs
- The “interim” folder has the data after we have cleaned it
- The “processed” folder has our finalized data, such as our model predictions

The requirements.txt includes all of the packages we use and the version numbers we use in our project.

Cookie cutter checklist
- All data files are put in the data folder
- All .py and .ipynb except setup.py are in the appropriate folder

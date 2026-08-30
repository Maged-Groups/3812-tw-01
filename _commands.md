# git commands

## Configure Your PC with GIT
```bash
git config --global user.name "YOUR NAME"
git config --global user.email "YOUR EMAIL"
```

## initiate a repo
```bash
git init
```

## Add finished work to stage
```bash
git add .
```

## Create a commit for stagged work
```bash
git commit -m "THE COMMIT FOR THE DONE TASK"
```

## Link local repo to GitHub repo
```bash
git remote add origin <GITHUB REPO URL>
```

## Push your commits to GitHub (first time only)
```bash
git push -u origin main
```

## Push your next commits to GitHub
```bash
git push
```

## Clone others repos
```bash
git clone <REPO URL>
```
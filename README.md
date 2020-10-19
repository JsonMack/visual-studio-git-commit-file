# Git Reference To Txt File
### A visual studio code extension that creates a .txt file with the last commit reference on the desktop or some user-defined path.

# How to use
There are effectively 2 ways to use this at the moment. You can either explicitly type the command using the command palette via (CTRL+SHIFT+P) on windows 
and (CMD+SHIFT+P) on mac. The other, arguably easier way, is to simply click the button in the bottom left that shows a pound icon, arrow icon, and file
icon grouped together (that's the best I can do okay).

![CommanPalette](https://raw.githubusercontent.com/JsonMack/visual-studio-git-commit-file/master/images/command_palette.png)

![StatusBarIcon](https://raw.githubusercontent.com/JsonMack/visual-studio-git-commit-file/master/images/status_bar_icon.png)

# User-defined settings
You can update your .code-workspace file to modify the path that the .txt file is created in and remove credits (I mean, why would you though?).

```json
    "settings": {
        "gitReferenceToTxt.folderAbsolutePath": "C:/My/Custom/Path",
        "gitReferenceToTxt.credits": false
    }
```

# Credits
Created by Jason MacKeigan for the 2020 PROG1700 class. I mean, the other guys can use it too I guess.
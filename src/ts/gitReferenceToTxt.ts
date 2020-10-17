import { join } from 'path';
import * as vscode from 'vscode';
import { GitExtension } from "./git";
import * as fs from "fs";
import * as os from "os";

/**
 * Called when the extension is activated. This by default registers a command that can
 * be executed to create a file that is comprised of the git reference as file name
 * and file content.
 * 
 * @param context The extensions vscode context.
 */
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerTextEditorCommand('gitReferenceToTxt.toFile', () => {
        const config = vscode.workspace.getConfiguration('gitReferenceToTxt');

        let configValueAbsolutePath = config.get<string>("folderAbsolutePath");

        let configValueCleanUp = config.get<Boolean>("cleanUp")

        let commitReference = findCommitReference(context);

        let filePath = determinePath(configValueAbsolutePath, defaultFolderPath());

        
    })
    context.subscriptions.push(disposable)
} 

/**
 * Retrieves the GitExtension object that this extension depends on for finding
 * repository related information.
 */
function getGitExtension(): GitExtension {
    return vscode.extensions.getExtension<GitExtension>('vscode.git').exports;
}

/**
 * Makes a best attempt at finding the commit reference at the head of this repository.
 * 
 * @param context The vscode context for this extension
 */
function findCommitReference(context: vscode.ExtensionContext): string {
    let gitExtension = getGitExtension();

    if (!gitExtension.enabled) {
        vscode.window.showWarningMessage("Git extension is not enabled.");
        return;
    }
    let api = gitExtension.getAPI(1);

    if (api.repositories.length == 0) {
        vscode.window.showInformationMessage("No repositories enabled.")
        
    }
    let repository = api.repositories[0];

    let head = repository.state.HEAD;
    
    return head.commit;
}

/**
 * Determines the path for the file to be created in, this is either the user defined path
 * or the default path if a custom one is not defined, cannot be found, or is empty (default).
 * 
 * @param userDefined The path defined by the user in configuration if they want to. By default empty.
 * @param defaultPath The default path, defiend by defaultFolderPath function.
 */
function determinePath(userDefined: string, defaultPath: string): string {
    if (userDefined.length == 0) {
        return defaultPath;
    }
    if (!fs.existsSync(userDefined)) {
        return defaultPath;
    }
    return userDefined;
}

/**
 * Calculates the default path used which is either the user desktop or user directory if
 * desktop cannot be found.
 */
function defaultFolderPath(): string {
    let path = os.homedir();

    let desktopPath = join(path, 'Desktop')
    
    if (fs.existsSync(desktopPath)) {
        return desktopPath;
    }
    return path;
}

/**
 * Creates a TXT file using the given folder and the commit reference as the name and content.
 * 
 * @param folder the folder that the file is created in.
 * @param commitReference the commit reference used as file name and content.
 */
function createFile(folder: string, commitReference: string) {
    fs.writeFileSync(join(folder, commitReference.concat(".txt")), commitReference);
}
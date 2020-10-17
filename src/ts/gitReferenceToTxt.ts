import { join } from 'path'
import * as vscode from 'vscode'
import { GitExtension } from "./git"
import * as fs from "fs"
import * as os from "os"

const CREDITS: string = 'Credits: git-reference-to-txt extension by Jason MacKeigan (w0270109)';

/**
 * Called when the extension is activated. This by default registers a command that can
 * be executed to create a file that is comprised of the git reference as file name
 * and file content.
 * 
 * @param context The extensions vscode context.
 */
export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerTextEditorCommand('git-reference-to-txt.create', () => execute(context))

    context.subscriptions.push(disposable)
} 

/**
 * Finds the commit reference and attempts to create a text file at a user-defined location or 
 * predefined location if necessary.
 * 
 * @param context The context for this extension.
 */
function execute(context: vscode.ExtensionContext) {
    try {
        const config = vscode.workspace.getConfiguration()

        let configValueAbsolutePath = config.get<string>('gitReferenceToTxt.folderAbsolutePath')
    
        let configValueCleanUp = config.get<boolean>('gitReferenceToTxt.cleanUp')

        let configValueCredits = config.get<boolean>('getReferenceToTxt.credits')
    
        let commitReference = findCommitReference(context)
    
        let filePath = determinePath(configValueAbsolutePath, defaultFolderPath())
    
        let shortCommitReference = commitReference.substr(0, 6)
    
        try {
            createFile(filePath, commitReference, configValueCredits)
        } catch (error) {
            vscode.window.showErrorMessage(`A file already exists with the commit reference #${shortCommitReference}.`)
            return
        }
        vscode.window.showInformationMessage(`Created .txt file with commit reference #${shortCommitReference}.`)
    } catch (e) {
        if (e instanceof GitNotEnabled) {
            vscode.window.showErrorMessage("Git is not enabled, cannot create commit file.")
        } else if (e instanceof RepositoryCannotBeFound) {
            vscode.window.showErrorMessage("Git repository cannot be found.")
        } else {
            vscode.window.showErrorMessage("Unexpected error: " + e)
        }
    }
    
}

/**
 * Retrieves the GitExtension object that this extension depends on for finding
 * repository related information.
 */
function getGitExtension(): GitExtension {
    return vscode.extensions.getExtension<GitExtension>('vscode.git').exports
}

/**
 * Makes a best attempt at finding the commit reference at the head of this repository.
 * 
 * @param context The vscode context for this extension
 */
function findCommitReference(context: vscode.ExtensionContext): string {
    let gitExtension = getGitExtension()

    if (!gitExtension.enabled) {
        throw new GitNotEnabled()
    }
    let api = gitExtension.getAPI(1)

    if (api.repositories.length == 0) {
        throw new RepositoryCannotBeFound()
    }
    let repository = api.repositories[0]

    let head = repository.state.HEAD
    
    return head.commit
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
        return defaultPath
    }
    if (!fs.existsSync(userDefined)) {
        return defaultPath
    }
    return userDefined
}

/**
 * Calculates the default path used which is either the user desktop or user directory if
 * desktop cannot be found.
 */
function defaultFolderPath(): string {
    let path = os.homedir()

    let desktopPath = join(path, 'Desktop')
    
    if (fs.existsSync(desktopPath)) {
        return desktopPath
    }
    return path
}

/**
 * Creates a TXT file using the given folder and the commit reference as the name and content.
 * 
 * @param folder the folder that the file is created in.
 * @param commitReference the commit reference used as file name and content.
 */
function createFile(folder: string, commitReference: string, credits: boolean) {
    let destination = join(folder, commitReference.concat(".txt"))

    if (fs.existsSync(destination)) {
        throw new FileAlreadyExistsError()
    }
    fs.writeFileSync(destination, credits ? `${commitReference}\n\n${CREDITS}` : commitReference)
}

/**
 * A simple error that indicates the file already exists.
 */
class FileAlreadyExistsError extends Error {
    
}

/**
 * An error to represent that git is not enabled.
 */
class GitNotEnabled extends Error {

}

/**
 * An error to represent that the git repository cannot be found.
 */
class RepositoryCannotBeFound extends Error {

}
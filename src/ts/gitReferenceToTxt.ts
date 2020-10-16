import * as vscode from 'vscode';
import { GitExtension } from "./git";

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerTextEditorCommand('gitReferenceToTxt.toFile', () => {
        toFile(context);
    })

    context.subscriptions.push(disposable)
}

function toFile(context: vscode.ExtensionContext) {
    let gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git').exports;

    let api = gitExtension.getAPI(1);

    let repository = api.repositories[0];

    let head = repository.state.HEAD;
    
    vscode.window.showInformationMessage("Head.commit: " + head.commit);
    vscode.window.showInformationMessage("Name.commit: " + head.name);
    vscode.window.showInformationMessage("Remote.commit: " + head.remote);
}


console.log('Executing Extension for VSCode');
import {Notice} from "obsidian";
import {MetaContent} from "./metacontent";
import {MoonPublisherSettings} from "./settings";
import axios, {Axios} from "axios";

export interface FileAttachment {
    filename: string;
    payload: string;
}

export interface PublishFile {
    id: string | null;
    name: string;
    path: string;
    metaContent: MetaContent
    attachments: FileAttachment[] // not used right now
}

export function createPublishFile(name: string, path: string, metaContent: MetaContent, attachments: FileAttachment[]) : PublishFile {
    const idOrNull : string | null = metaContent.metadata.get("id");
    
    return {
        id: idOrNull,
        name: name,
        path: path,
        metaContent: metaContent,
        attachments: attachments
    }
}

export class Publisher {
    settings: MoonPublisherSettings;
    
    constructor(settings: MoonPublisherSettings) {
        this.settings = settings;
    }
    
    private toKeyValues(map:Map<string,any>) : { key : string, value : any }[] {
        const pairs : { key : string, value : any }[] = [];
        map.forEach((value, key) => {
            pairs.push({ key: key, value: value })
        });
        return pairs;
    }
    
    private toAttachments(att:FileAttachment[]) : { filename : string, payload : string }[] {
        const pairs : { filename : string, payload : string }[] = [];
        att.forEach((value) => {
            pairs.push({ filename: value.filename, payload: value.payload })
        });
        return pairs;
    }
    
    private getHeaders() {
        return { 
            headers: {
                "Content-Type": "application/json",
                "api-key": this.settings.apiKey,
                "api-secret": this.settings.apiSecret
            }
        }
    }   
    
    private resultWithNotification<S,E>(successMessage:string, failureMessage:string, successData:S, errorData:E, status? :number) : S | E {
        if (status != null && status >= 200 && status <= 204) {
            new Notice(successMessage);
            return successData;
        } else {
            new Notice(failureMessage);
            return errorData
        }
    }
    
    async publish(file: PublishFile) : Promise<string | null> {
        const success = "File successfully published";
        const failure = "An error occurred while publishing the file. Please check your plugin configuration.";
        
        const payload = {
            name : file.name,
            path : file.path,
            metadata : this.toKeyValues(file.metaContent.metadata),
            content : file.metaContent.content,
            attachments : this.toAttachments(file.attachments)
        }
        
        new Notice("Publishing file...");
        
        try {
            const { data, status } = await axios.post<{ id : string }>(this.settings.baseUrl, payload, this.getHeaders());
            return this.resultWithNotification(success, failure, data.id, null, status);
        }
        catch (e) {
            return this.resultWithNotification(success, failure, null, null);
        }
    }
    
    private urlWithId (i:string): string {
        if (this.settings.baseUrl.endsWith("/")) {
            return this.settings.baseUrl + i;
        } else {
            return this.settings.baseUrl + "/" + i;
        }
    }
    
    async unpublish(file: PublishFile) : Promise<boolean> {
        const success = "File successfully unpublished";
        const failure = "An error occurred while unpublishing the file. Please check your plugin configuration.";
        
        if (file.id == null) {
            new Notice("File doesn't have an ID in metadata so it's considered already unpublished.");
            return false;
        }
        new Notice("Unpublishing file...");
        
        try {
            const { status } = await axios.post<{ id : string }>(this.urlWithId(file.id), {}, this.getHeaders());
            return this.resultWithNotification(success, failure, true, false, status);
        }
        catch (e) {
            return this.resultWithNotification(success, failure, true, false);
        }
    }
}


﻿import {Notice} from "obsidian";
import {MetaContent, Metadata} from "./metacontent";
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
    
    private getUrl(i?:string) {
        const url = this.settings.baseUrl;
        if (url == "") {
            new Notice("Please configure the plugin first.");
            return null;
        }
        if (url.endsWith("/")) {
            return url + i;
        } else {
            return url + "/" + i;
        }
    }
    
    async publish(file: PublishFile) : Promise<Metadata | null> {
        const success = "File successfully published.";
        const failure = "An error occurred while publishing the file. Please check your plugin configuration.";
        
        const payload = {
            name : file.name,
            path : file.path,
            metadata : Metadata.toObj(file.metaContent.metadata),
            content : file.metaContent.content,
            attachments : this.toAttachments(file.attachments)
        }
        
        const url = this.getUrl();
        
        if (url != null) {
            try {
                new Notice("Publishing file...");
                const { data, status } = await axios.post<any>(url, payload, this.getHeaders());
                const responseMetadata = Metadata.fromObj(data);
                return this.resultWithNotification(success, failure, responseMetadata, null, status);
            }
            catch (e) {
                return this.resultWithNotification(success, failure, null, null);
            }
        }
        return null;
    }
    
    async unpublish(file: PublishFile) : Promise<Metadata | null> {
        const success = "File successfully unpublished.";
        const failure = "An error occurred while unpublishing the file. Please check your plugin configuration.";
        
        if (file.id == null) {
            new Notice("File doesn't have an ID in metadata so it's considered already unpublished.");
            return null;
        }
        
        const url = this.getUrl(file.id);
        
        if (url != null) {
            try {
                new Notice("Unpublishing file...");
                const { data, status } = await axios.post<any>(url, {}, this.getHeaders());
                const responseMetadata = Metadata.fromObj(data);
                return this.resultWithNotification(success, failure, responseMetadata, null, status);
            }
            catch (e) {
                return this.resultWithNotification(success, failure, null, null);
            }
        }
        return null;
    }
}


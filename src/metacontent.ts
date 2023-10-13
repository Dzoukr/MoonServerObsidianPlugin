import { parse, stringify } from 'yaml'

const RAW_PROPERTIES_TAG = "---";

module Parser {
    function parseRawProperties(value:string) : string {
        let enabled = true;
        let isReading = false;
        let content : string [] = [];

        value.split("\n").forEach((line) => { 
            if (enabled && !isReading && line.startsWith(RAW_PROPERTIES_TAG)) {
                isReading = true;
                return;
            }
            
            if (enabled && isReading && line.startsWith(RAW_PROPERTIES_TAG)) {
                isReading = false;
                enabled = false;
                return;
            }
            
            if (isReading) {
                content.push(line);
                return;
            }
        });
        return content.join("\n") + "\n"; //for some reason it's needed here
    }

    function parseWithoutProperties(value:string) : string {
        let found = 0;
        let isReading = false;
        let content: string [] = [];
        const lines = value.split("\n");
        lines.forEach((line) => {
            if (!isReading && line.startsWith(RAW_PROPERTIES_TAG)) {
                found++;
                if (found == 2) {
                    isReading = true;
                    return;
                }
                return;
            }

            if (isReading) {
                content.push(line);
                return;
            }
        });

        if (isReading) {
            return content.join("\n");
        } else {
            return value;
        }
    }
    
    export function parseMetadata(value:string) : Metadata {
        const raw = parseRawProperties(value);
        let map = parse(raw, {mapAsMap: true});
        if (map == null) {
            map = new Map<string, any>()
        }
        return map;
    }
    
    export function parseContent(value:string) : string {
        return parseWithoutProperties(value);
    }
}

export type Metadata = Map<string,any>;

export module Metadata {
    export function toObj(map:Metadata) : object {
        const obj : any = {};
        map.forEach((value, key) => {
            obj[key] = value;
        });
        return obj;
    }
    export function fromObj(obj:any) : Metadata {
        const map = new Map<string,any>();
        Object.keys(obj).forEach((key) => {
            map.set(key, obj[key]);
        });
        return map;
    }
    export function merge(m1:Metadata, m2:Metadata) : Metadata {
        let merged = new Map<string,any>();
        m1.forEach((value, key) => {
            merged.set(key, value);
        });
        m2.forEach((value, key) => {
            merged.set(key, value);
        });
        merged.forEach((value, key) => {
            if (value == null) {
                merged.delete(key);
            }
        });
        return merged;
    }
}

export type Attachments = Map<string,string>;

export module Attachments {

    function arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    
    export function toObj(map: Attachments): object {
        const obj: any = {};
        map.forEach((value, key) => {
            obj[key] = value;
        });
        return obj;
    }
    export function fromMap(map: Map<string,ArrayBuffer>) : Attachments {
        const att = new Map<string,string>();
        map.forEach((value, key) => {
            att.set(key, arrayBufferToBase64(value));
        });
        return att;
    }
}

export class MetaContent {
    readonly metadata : Metadata
    readonly content : string
    
    private constructor(metadata:Map<string,any>, content:string) {
        this.metadata = metadata;
        this.content = content;
    }
    
    
    withMetadata(m:Metadata) : MetaContent {
        const newMetadata = Metadata.merge(this.metadata, m);
        return new MetaContent(newMetadata, this.content);
    }
    
    static fromText(text:string) : MetaContent {
        const metadata = Parser.parseMetadata(text);
        const content = Parser.parseContent(text);
        return new MetaContent(metadata, content);
    }
    
    static toText(metaPage:MetaContent) : string {
        let metadataText = "";
        if (metaPage.metadata.size > 0) {
            metadataText += RAW_PROPERTIES_TAG + "\n";
            metadataText += stringify(metaPage.metadata)
            metadataText += RAW_PROPERTIES_TAG + "\n";
        }
        return metadataText + metaPage.content;
    }
}


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
    
    export function parseMetadata(value:string) : Map<string,any> {
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

export class MetaContent {
    readonly metadata : Map<string,any>
    readonly content : string
    
    private constructor(metadata:Map<string,any>, content:string) {
        this.metadata = metadata;
        this.content = content;
    }
    
    withoutId() : MetaContent {
        const newMetadata = new Map<string,any>();
        this.metadata.forEach((value, key) => { 
            if (key != "id") {
                newMetadata.set(key, value);
            }
        });
        return new MetaContent(newMetadata, this.content);
    }
    
    withId(i:string) : MetaContent {
        const newMetadata = new Map<string,any>();
        newMetadata.set("id", i);
        this.metadata.forEach((value, key) => { 
            newMetadata.set(key, value);
        });
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


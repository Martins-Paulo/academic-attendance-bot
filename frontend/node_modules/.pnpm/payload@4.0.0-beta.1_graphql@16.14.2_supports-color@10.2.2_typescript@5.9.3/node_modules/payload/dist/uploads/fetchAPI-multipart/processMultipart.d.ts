import type { FetchAPIFileUploadOptions } from '../../config/types.js';
import type { FetchAPIFileUploadResponse } from './index.js';
type ProcessMultipart = (args: {
    options: FetchAPIFileUploadOptions;
    request: Request;
}) => Promise<FetchAPIFileUploadResponse>;
export declare const processMultipart: ProcessMultipart;
export {};
//# sourceMappingURL=processMultipart.d.ts.map
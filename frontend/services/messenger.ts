// messengerApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {staggeredBaseQueryWithBailOut} from "@/services/auth";

export type Attachment = {
    id: number;
    url: string;
    name: string;
    size: number;
    type: string;
};


export const messengerApi = createApi({
    reducerPath: "messengerApi",
    baseQuery: staggeredBaseQueryWithBailOut,
    tagTypes: ["Attachments"],
    endpoints: (builder) => ({
        uploadAttachment: builder.mutation<Attachment, FormData>({
            query: (formData) => ({
                url: "attachments/upload/",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: ["Attachments"],
        }),
    }),
});

export const { useUploadAttachmentMutation } = messengerApi;
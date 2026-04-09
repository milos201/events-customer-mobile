import { expoClient } from "@better-auth/expo/client";
import { createAuthClient } from "better-auth/react";
import * as SecureStore from "expo-secure-store";

import { appConfig } from "@/lib/config";

export const authClient = createAuthClient({
    baseURL: appConfig.auth.baseUrl,
    plugins: [
        expoClient({
            scheme: appConfig.auth.scheme,
            storagePrefix: appConfig.auth.storagePrefix,
            storage: SecureStore,
        }),
    ],
});

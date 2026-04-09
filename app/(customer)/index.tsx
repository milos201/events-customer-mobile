import { Redirect, type Href } from "expo-router";

export default function CustomerIndexRoute() {
    return <Redirect href={"/appointments" as Href} />;
}

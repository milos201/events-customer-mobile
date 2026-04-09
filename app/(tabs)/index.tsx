import { Redirect, type Href } from "expo-router";

export default function TabsIndexRoute() {
    return <Redirect href={"/" as Href} />;
}

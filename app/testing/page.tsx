"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import supabase from "../../lib/supabase"

export default function TestPage() {
    const [profiles, setProfiles]: [any[], Dispatch<SetStateAction<never[]>>] = useState([]);

    useEffect(() => {
        getProfiles();
    }, []);

    async function getProfiles() {
        const { data, error } = await supabase.from("profiles").select();
        console.log(error, data)
        setProfiles(data as never[]);
    }

    return (
        <ul>
        {profiles.map((profile) => (
            <li key={profile.username}>{profile.username}</li>
        ))}
        </ul>
    );
}
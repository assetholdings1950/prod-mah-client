"use client";

import { useEffect, useState } from "react";
import { Globe, MapPin, Phone } from "lucide-react";
import appClient from "@/lib/appClient";
import type { ClientProfile, FormState } from "./types";
import { Cell, Block, inputCls, Field } from "./ui";
import { fmt } from "./helpers";
import { SearchableSelect } from "@/components/UI/SearchableSelect";

interface CountryData {
    name: string;
    code: string;
    dialCode: string;
    cities: string[];
}

interface Props {
    profile: ClientProfile;
    editMode: boolean;
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
}

export function AddressBlock({ profile, editMode, form, setForm }: Props) {
    const [countries, setCountries] = useState<CountryData[]>([]);
    const [loading,   setLoading]   = useState(false);

    useEffect(() => {
        if (!editMode) return;
        setLoading(true);
        appClient.get("/api/countries")
            .then(res => {
                const data: CountryData[] = res.data?.data ?? res.data ?? [];
                setCountries(Array.isArray(data) ? data : []);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [editMode]);

    const countryNames = countries.map(c => c.name);
    const dialMap      = Object.fromEntries(countries.map(c => [c.name, c.dialCode]));
    const cityOptions  = countries.find(c => c.name === form.country)?.cities ?? [];

    function handleCountryChange(country: string) {
        const countryCode = dialMap[country] ?? "";
        setForm(p => ({ ...p, country, countryCode, city: "" }));
    }

    return (
        <Block index="02" title="Contact & address" hint="Where we reach and reference you.">
            {editMode ? (
                <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                    <Field label="Country">
                        <SearchableSelect
                            value={form.country}
                            onChange={handleCountryChange}
                            options={countryNames}
                            optionMeta={dialMap}
                            allowCustom
                            placeholder={loading ? "Loading…" : "Select country"}
                            searchPlaceholder="Search country…"
                        />
                    </Field>
                    <Field label="City">
                        <SearchableSelect
                            value={form.city}
                            onChange={city => setForm(p => ({ ...p, city }))}
                            options={cityOptions}
                            allowCustom
                            placeholder={!form.country ? "Select country first" : "Select city"}
                            searchPlaceholder="Search city…"
                            emptyMessage="No cities found."
                        />
                    </Field>
                    <Field label="Country code">
                        <div className={`${inputCls()} flex items-center gap-2 bg-slate-50 select-none cursor-not-allowed opacity-60`}>
                            <span className={`font-mono text-[14px] font-semibold ${form.countryCode ? "text-[#0e1f3d]" : "text-slate-300"}`}>
                                {form.countryCode || "—"}
                            </span>
                            {form.countryCode && (
                                <span className="ml-auto rounded-md bg-slate-200/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                                    auto
                                </span>
                            )}
                        </div>
                    </Field>
                    <Field label="Postal code">
                        <input
                            className={inputCls()} value={form.postalCode} placeholder="Postal / ZIP"
                            onChange={e => setForm(p => ({ ...p, postalCode: e.target.value }))}
                        />
                    </Field>
                    <div className="sm:col-span-2 lg:col-span-2">
                        <Field label="Street address">
                            <input
                                className={inputCls()} value={form.address} placeholder="Street address"
                                onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                            />
                        </Field>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
                    <Cell label="Country" icon={<Globe className="h-3 w-3 text-slate-300" />} value={fmt(profile.country)} />
                    <Cell label="City" value={fmt(profile.city)} />
                    <Cell
                        label="Country code"
                        icon={<Phone className="h-3 w-3 text-slate-300" />}
                        value={
                            profile.countryCode
                                ? <span className="font-mono">{profile.countryCode}</span>
                                : <span className="text-slate-300">—</span>
                        }
                    />
                    <Cell label="Postal code" value={fmt(profile.postalCode)} />
                    <div className="sm:col-span-2 lg:col-span-2">
                        <Cell label="Street address" icon={<MapPin className="h-3 w-3 text-slate-300" />} value={fmt(profile.address)} />
                    </div>
                </div>
            )}
        </Block>
    );
}

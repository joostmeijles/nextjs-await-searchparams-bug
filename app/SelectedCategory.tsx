'use client'

import { useSearchParams } from "next/navigation"

export function SelectedCategory() {
    const params = useSearchParams();

    const category = params.get('category');

    return <span>Category (via useSearchParams): {category}</span>
}
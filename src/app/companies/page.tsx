"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Search, ArrowRight } from "lucide-react";
import type { Company } from "@/generated/prisma/client";

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        
        const res = await fetch(`/api/companies?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setCompanies(data);
        }
      } catch (error) {
        console.error("Failed to fetch companies:", error);
      } finally {
        setLoading(false);
      }
    }

    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchCompanies();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-50 mb-2">Companies</h1>
          <p className="text-gray-400">
            Browse salary data by company and compare average compensations.
          </p>
        </div>
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 bg-gray-900/50 py-2 pl-10 pr-3 text-white shadow-sm ring-1 ring-inset ring-gray-800 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6"
            placeholder="Search companies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-gray-900/50 rounded-xl animate-pulse border border-gray-800" />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="text-center py-12 bg-gray-900/30 rounded-xl border border-gray-800">
          <Building2 className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-200">No companies found</h3>
          <p className="text-gray-400 mt-2">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${encodeURIComponent(company.name)}`}
              className="block group bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-emerald-500/50 hover:bg-gray-800/50 transition-all"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-md bg-gray-800 flex items-center justify-center text-xl font-bold text-gray-300">
                    {company.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-100 group-hover:text-emerald-400 transition-colors">
                      {company.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {company.entryCount} {company.entryCount === 1 ? "entry" : "entries"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-600 group-hover:text-emerald-500 transition-colors" />
              </div>
              
              <div className="pt-4 border-t border-gray-800 flex justify-between items-center">
                <span className="text-sm text-gray-400">Avg. Total Comp</span>
                <span className="font-medium text-emerald-400">
                  ${company.averageCompensation.toLocaleString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

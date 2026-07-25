"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type ScanHistoryItem = {
  id: string;
  item_name: string;
  category: string;
  recyclable: boolean;
  created_at: string;
};

type HistoryListProps = {
  scans: ScanHistoryItem[];
};

function formatScanDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function HistoryList({ scans }: HistoryListProps) {
  const [search, setSearch] = useState("");

  const filteredScans = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return scans;
    }

    return scans.filter((scan) =>
      scan.item_name.toLowerCase().includes(keyword),
    );
  }, [scans, search]);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative max-w-md">
        <Search
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={search}
          placeholder="Search by item name"
          className="bg-background pl-8"
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {scans.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-48 items-center justify-center text-center text-sm text-muted-foreground">
            No scan history yet. Analyze your first waste item to build your history.
          </CardContent>
        </Card>
      ) : filteredScans.length === 0 ? (
        <Card>
          <CardContent className="flex min-h-48 items-center justify-center text-center text-sm text-muted-foreground">
            No scans match your search.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="hidden md:block">
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Recyclable</TableHead>
                    <TableHead className="text-right">Scan Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScans.map((scan) => (
                    <TableRow key={scan.id}>
                      <TableCell className="font-medium">
                        {scan.item_name}
                      </TableCell>
                      <TableCell>{scan.category}</TableCell>
                      <TableCell>
                        <Badge variant={scan.recyclable ? "secondary" : "outline"}>
                          {scan.recyclable ? "Yes" : "No"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatScanDate(scan.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <div className="grid gap-3 md:hidden">
            {filteredScans.map((scan) => (
              <Card key={scan.id}>
                <CardHeader>
                  <CardTitle className="text-base">{scan.item_name}</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Category</span>
                    <span className="font-medium">{scan.category}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Recyclable</span>
                    <Badge variant={scan.recyclable ? "secondary" : "outline"}>
                      {scan.recyclable ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Scan Date</span>
                    <span className="text-right font-medium">
                      {formatScanDate(scan.created_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

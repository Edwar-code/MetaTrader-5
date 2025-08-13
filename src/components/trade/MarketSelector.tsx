
"use client";

import * as React from 'react';
import { useMemo, useState } from "react";
import { useDerivState, ActiveSymbol } from "@/context/DerivContext";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatAssetDisplayName } from "@/lib/utils";

interface MarketSelectorProps {
  asset: string;
  setAsset: (asset: string) => void;
  marketFilter: string;
}

interface GroupedSymbols {
  [market: string]: {
    [submarket: string]: ActiveSymbol[];
  };
}

export function MarketSelector({ asset, setAsset, marketFilter }: MarketSelectorProps) {
  const { activeSymbols } = useDerivState();
  const [search, setSearch] = useState("");

  const filteredAndGroupedSymbols = useMemo(() => {
    let marketSymbols = activeSymbols.filter(s => s.market === marketFilter);

    // If the market is "Derived", only show "Continuous Indices"
    if (marketFilter === 'synthetic_index') {
      marketSymbols = marketSymbols.filter(s => s.submarket_display_name === 'Continuous Indices');
    }

    const searchFiltered = marketSymbols.filter(
      (s) =>
        s.display_name.toLowerCase().includes(search.toLowerCase()) ||
        s.symbol.toLowerCase().includes(search.toLowerCase())
    );

    return searchFiltered.reduce<GroupedSymbols>((acc, symbol) => {
      const { market_display_name, submarket_display_name } = symbol;
      if (!acc[market_display_name]) {
        acc[market_display_name] = {};
      }
      if (!acc[market_display_name][submarket_display_name]) {
        acc[market_display_name][submarket_display_name] = [];
      }
      acc[market_display_name][submarket_display_name].push(symbol);
      return acc;
    }, {});
  }, [activeSymbols, search, marketFilter]);

  return (
    <Select value={asset} onValueChange={setAsset}>
      <SelectTrigger id="asset">
        <SelectValue placeholder="Select market" />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2">
            <Input
                placeholder="Search markets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
            />
        </div>
        <ScrollArea className="h-72">
            {Object.entries(filteredAndGroupedSymbols).map(([marketName, submarkets]) => (
            <SelectGroup key={marketName}>
                <SelectLabel>{marketName}</SelectLabel>
                {Object.entries(submarkets).map(([submarketName, symbols]) => (
                <React.Fragment key={submarketName}>
                    {symbols.map((symbol) => (
                    <SelectItem key={symbol.symbol} value={symbol.symbol}>
                        {formatAssetDisplayName(symbol.display_name)}
                    </SelectItem>
                    ))}
                </React.Fragment>
                ))}
            </SelectGroup>
            ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
}

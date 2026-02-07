"use client";

import { SettingsIcon, SunIcon, MoonIcon, MonitorIcon, ZapIcon, WalletIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useWalletStore } from "@/stores/wallet-store";
import { formatSats } from "@/lib/format";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const balance = useWalletStore((s) => s.balance);
  const streamingRate = useWalletStore((s) => s.streamingRate);
  const setStreamingRate = useWalletStore((s) => s.setStreamingRate);
  const topUp = useWalletStore((s) => s.topUp);
  const transactions = useWalletStore((s) => s.transactions);

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="size-8" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Customize your PodCentral experience
          </p>
        </div>
      </div>

      <div className="grid max-w-2xl gap-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
              >
                <SunIcon className="mr-1 size-4" /> Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
              >
                <MoonIcon className="mr-1 size-4" /> Dark
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
              >
                <MonitorIcon className="mr-1 size-4" /> System
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Playback */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Playback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm">Default Playback Speed</Label>
              <p className="text-xs text-muted-foreground">
                Controlled via the speed button in the player bar
              </p>
            </div>
            <div>
              <Label className="text-sm">Skip Forward / Back Intervals</Label>
              <p className="text-xs text-muted-foreground">
                Currently set to 10 seconds (default)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Wallet */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <WalletIcon className="size-5" /> Wallet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{formatSats(balance)}</p>
                <p className="text-sm text-muted-foreground">Current balance</p>
              </div>
              <Button onClick={() => topUp(10000)}>
                <ZapIcon className="mr-1 size-4" /> Top Up 10k sats
              </Button>
            </div>

            <Separator />

            <div>
              <Label htmlFor="streaming-rate" className="text-sm">
                Streaming Rate: {streamingRate} sats/min
              </Label>
              <Slider
                id="streaming-rate"
                value={[streamingRate]}
                onValueChange={(v) => setStreamingRate(v[0])}
                min={10}
                max={500}
                step={10}
                className="mt-2"
                aria-label="Streaming rate in sats per minute"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Sats streamed per minute while listening to value-enabled podcasts
              </p>
            </div>

            <Separator />

            <div>
              <p className="mb-2 text-sm font-medium">Recent Transactions</p>
              <div className="flex flex-col gap-2">
                {transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs capitalize">
                        {tx.type}
                      </Badge>
                      {tx.recipient && (
                        <span className="text-muted-foreground">
                          {tx.recipient}
                        </span>
                      )}
                      {tx.message && (
                        <span className="truncate text-xs text-muted-foreground">
                          &quot;{tx.message}&quot;
                        </span>
                      )}
                    </div>
                    <span
                      className={
                        tx.amount > 0
                          ? "font-mono text-green-500"
                          : "font-mono text-muted-foreground"
                      }
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {formatSats(Math.abs(tx.amount))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Identity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Podcast Index API credentials and Nostr keypair management will be
              available when the database layer is connected.
            </p>
          </CardContent>
        </Card>

        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-medium">PodCentral</span> — Podcasting
              2.0 Client Prototype
            </p>
            <p className="text-muted-foreground">
              Built with Next.js, shadcn/ui, audio-ui, and Tailwind CSS
            </p>
            <p className="text-muted-foreground">
              Implements the full Podcasting 2.0 namespace
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

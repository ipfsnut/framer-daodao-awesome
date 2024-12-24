import React, { useEffect, useState } from 'react'

// Types
interface TokenConfig {
  displayName: string
  decimals: number
}

interface TokenConfigs {
  [key: string]: TokenConfig
}

interface Balance {
  denom: string
  displayName: string
  amount: string
}

// Constants
const DAO_ADDRESS = "osmo1sy9k228qzke0nd3k3vmxdvr68xdlqsu66h3xgm9ke3c4jhamusvsz98pre"
const CHAIN_ID = "osmosis-1"
const BASE_URL = "https://indexer.daodao.zone"

const TOKEN_CONFIG: TokenConfigs = {
  "factory/osmo1s6ht8qrm8x0eg8xag5x3ckx9mse9g4se248yss/BERNESE": {
    displayName: "BERNESE",
    decimals: 6,
  },
  "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC": {
    displayName: "allBTC",
    decimals: 8,
  },
  "gamm/pool/1344": {
    displayName: "GAMM-1344",
    decimals: 6,
  },
  "ibc/23A62409E4AD8133116C249B1FA38EED30E500A115D7B153109462CD82C1CD99": {
    displayName: "PAGE",
    decimals: 8,
  },
  "ibc/75345531D87BD90BF108BE7240BD721CB2CB0A1F16D4EBA71B09EC3C43E15C8F": {
    displayName: "nBTC",
    decimals: 14,
  },
}

// Utility functions
const formatTokenName = (denom: string): string => {
  return (
    TOKEN_CONFIG[denom]?.displayName ||
    (() => {
      if (denom.includes("factory/")) {
        const parts = denom.split("/")
        return parts[parts.length - 1]
      } else if (denom.includes("gamm/pool/")) {
        return `GAMM-${denom.split("/").pop()}`
      } else if (denom.includes("ibc/")) {
        return "IBC Token"
      }
      return denom
    })()
  )
}

const formatAmount = (amount: string, denom: string): string => {
  const decimals = TOKEN_CONFIG[denom]?.decimals || 6
  const num = parseFloat(amount) / Math.pow(10, decimals)

  if (isNaN(num)) return "0"

  if (num < 0.000001) {
    return num.toFixed(14)
  } else if (num < 0.01) {
    return num.toFixed(8)
  } else if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}M`
  } else if (num >= 1_000) {
    return `${(num / 1_000).toFixed(2)}K`
  } else if (num >= 1) {
    return num.toFixed(2)
  } else {
    return num.toFixed(6)
  }
}

// Main component
export default function TreasuryWidget() {
  const [balances, setBalances] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBalances = async () => {
      try {
        const balancesUrl = `${BASE_URL}/${CHAIN_ID}/account/${DAO_ADDRESS}/bank/balances`
        const balancesRes = await fetch(balancesUrl)

        if (balancesRes.ok) {
          const balancesData = await balancesRes.json()
          setBalances(balancesData)
        }
      } catch (err) {
        setError(`Failed to load treasury data: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchBalances()
    const interval = setInterval(fetchBalances, 30000)
    return () => clearInterval(interval)
  }, [])

  const balanceEntries: Balance[] = Object.entries(balances)
    .filter(([_, amount]) => parseFloat(amount) > 0)
    .map(([denom, amount]) => ({
      denom,
      displayName: formatTokenName(denom),
      amount,
    }))

  if (loading) return <div>Loading treasury...</div>

  return (
    <div
      style={{
        marginBottom: "32px",
        padding: "20px",
        backgroundColor: "#f8fafc",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
      }}
    >
      <h3
        style={{
          fontSize: "20px",
          fontWeight: "600",
          marginBottom: "16px",
          color: "#0f172a",
          textAlign: "center",
        }}
      >
        Treasury
      </h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {balanceEntries.map(({ denom, displayName, amount }) => (
          <div
            key={denom}
            style={{
              padding: "16px",
              backgroundColor: "white",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                fontWeight: "600",
                color: "#1e293b",
              }}
            >
              {formatAmount(amount, denom)} {displayName}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#94a3b8",
                marginTop: "2px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
              title={denom}
            >
              {denom}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

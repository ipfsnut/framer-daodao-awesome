import React, { useState, useEffect } from 'react'

// First, let's include our types and interfaces
interface Proposal {
  id: string
  title: string
  description: string
  status: 'open' | 'passed' | 'rejected' | 'executed'
  createdAt: string
  completedAt?: string
}

interface WalletInfo {
  address: string
  signer: any
}

// Constants
const DAO_ADDRESS = "osmo1sy9k228qzke0nd3k3vmxdvr68xdlqsu66h3xgm9ke3c4jhamusvsz98pre"
const CHAIN_ID = "osmosis-1"
const BASE_URL = "https://indexer.daodao.zone"

// Utility function for date formatting
const formatDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch (e) {
    return "Invalid date"
  }
}

// ProposalCard Component
function ProposalCard({ 
  proposal, 
  isExpanded, 
  onToggle, 
  onVote, 
  walletAddress, 
  voting 
}: {
  proposal: Proposal
  isExpanded: boolean
  onToggle: () => void
  onVote: (proposalId: string, vote: 'yes' | 'no') => void
  walletAddress?: string
  voting: boolean
}) {
  return (
    <div
      style={{
        marginBottom: "16px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        transition: "all 0.2s ease",
        cursor: "pointer",
        boxShadow: isExpanded ? "0 4px 6px rgba(0, 0, 0, 0.1)" : "none",
      }}
      onClick={onToggle}
    >
      <div
        style={{
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: isExpanded ? "1px solid #e5e7eb" : "none",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "4px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>#{proposal.id}</span>
            <span>{proposal.title}</span>
          </div>

          {!isExpanded && (
            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {proposal.description.slice(0, 100)}...
            </div>
          )}
        </div>

        <div
          style={{
            padding: "6px 12px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: "500",
            backgroundColor:
              proposal.status === "passed"
                ? "#dcfce7"
                : proposal.status === "rejected"
                ? "#fee2e2"
                : proposal.status === "open"
                ? "#fff7ed"
                : "#f3f4f6",
            color:
              proposal.status === "passed"
                ? "#166534"
                : proposal.status === "rejected"
                ? "#991b1b"
                : proposal.status === "open"
                ? "#9a3412"
                : "#374151",
            marginLeft: "12px",
            whiteSpace: "nowrap",
          }}
        >
          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
        </div>
      </div>

      {isExpanded && (
        <>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderBottomLeftRadius: "12px",
              borderBottomRightRadius: "12px",
            }}
          >
            <div
              style={{
                fontSize: "15px",
                lineHeight: "1.6",
                color: "#374151",
                marginBottom: "16px",
                whiteSpace: "pre-wrap",
              }}
            >
              {proposal.description}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "13px",
                color: "#6b7280",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "12px",
                marginTop: "12px",
              }}
            >
              <div>
                <span style={{ fontWeight: "500" }}>Created:</span>{" "}
                {formatDate(proposal.createdAt)}
              </div>
              {proposal.completedAt && (
                <div>
                  <span style={{ fontWeight: "500" }}>Completed:</span>{" "}
                  {formatDate(proposal.completedAt)}
                </div>
              )}
            </div>
          </div>

          {walletAddress && proposal.status === "open" && (
            <div style={{ padding: "16px", borderTop: "1px solid #e5e7eb" }}>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onVote(proposal.id, "yes")
                  }}
                  disabled={voting}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: voting ? "#9ca3af" : "#22c55e",
                    color: "white",
                    borderRadius: "6px",
                    cursor: voting ? "wait" : "pointer",
                  }}
                >
                  {voting ? "Voting..." : "Vote Yes"}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onVote(proposal.id, "no")
                  }}
                  disabled={voting}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: voting ? "#9ca3af" : "#ef4444",
                    color: "white",
                    borderRadius: "6px",
                    cursor: voting ? "wait" : "pointer",
                  }}
                >
                  {voting ? "Voting..." : "Vote No"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// Main ProposalsWidget Component
export default function ProposalsWidget() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null)
  const [voting, setVoting] = useState(false)

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const proposalsUrl = `${BASE_URL}/${CHAIN_ID}/contract/${DAO_ADDRESS}/daoCore/allProposals`
        const proposalsRes = await fetch(proposalsUrl)
        
        if (!proposalsRes.ok) {
          throw new Error(`HTTP error! status: ${proposalsRes.status}`)
        }

        const proposalsData = await proposalsRes.json()

        if (Array.isArray(proposalsData)) {
          const processedProposals: Proposal[] = proposalsData
            .map(p => ({
              id: p.id,
              title: p.proposal?.title || "Untitled Proposal",
              description: p.proposal?.description || "No description provided",
              status: (p.proposal?.status || "unknown") as Proposal['status'],
              createdAt: p.createdAt,
              completedAt: p.completedAt,
            }))
            .reverse()

          setProposals(processedProposals)
        }
      } catch (err) {
        setError(`Failed to load proposals: ${err instanceof Error ? err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchProposals()
    const interval = setInterval(fetchProposals, 30000)
    return () => clearInterval(interval)
  }, [])

  const toggleProposal = (id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const connectKeplr = async () => {
    try {
      if (!window.keplr) {
        throw new Error("Please install Keplr extension")
      }

      await window.keplr.enable(CHAIN_ID)
      const offlineSigner = window.keplr.getOfflineSigner(CHAIN_ID)
      const accounts = await offlineSigner.getAccounts()
      const address = accounts[0].address

      setWalletInfo({ address, signer: offlineSigner })
    } catch (err) {
      console.error('Failed to connect:', err)
    }
  }

  const handleVote = async (proposalId: string, vote: 'yes' | 'no') => {
    if (!walletInfo) return
    setVoting(true)
    
    try {
      console.log(`Voting ${vote} on proposal ${proposalId} from address ${walletInfo.address}`)
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Vote failed:', error)
    } finally {
      setVoting(false)
    }
  }

  if (loading) return <div>Loading proposals...</div>

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        {!walletInfo ? (
          <button
            onClick={connectKeplr}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Connect Keplr
          </button>
        ) : (
          <div style={{ fontSize: '14px', color: '#4b5563' }}>
            Connected: {walletInfo.address.slice(0, 8)}...{walletInfo.address.slice(-6)}
          </div>
        )}
      </div>

      <h2
        style={{
          fontSize: "24px",
          fontWeight: "bold",
          marginBottom: "24px",
          textAlign: "center",
          color: "#111827",
        }}
      >
        Proposals ({proposals.length})
      </h2>

      <div
        style={{
          maxHeight: "800px",
          overflowY: "auto",
          padding: "4px",
        }}
      >
        {proposals.map(proposal => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            isExpanded={expandedIds.has(proposal.id)}
            onToggle={() => toggleProposal(proposal.id)}
            onVote={handleVote}
            walletAddress={walletInfo?.address}
            voting={voting}
          />
        ))}
      </div>

      {error && (
        <div style={{
          marginTop: "20px",
          padding: "12px",
          backgroundColor: "#fee2e2",
          borderRadius: "8px",
          color: "#991b1b",
          textAlign: "center",
        }}>
          {error}
        </div>
      )}
    </div>
  )
}

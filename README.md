# framer-daodao-awesome

DAO Dashboard Widgets for Framer

A collection of React-based widgets designed for seamless integration with Framer, providing real-time DAO treasury and proposal management functionality.

Features

Treasury Widget
- Real-time token balance display
- Automatic denomination formatting
- Support for multiple token types (native, IBC, factory)
- 30-second auto-refresh
- Responsive grid layout

Proposals Widget
- Live proposal listing and management
- Interactive expandable proposal cards
- Keplr wallet integration
- Voting capabilities
- Status indicators
- Detailed proposal view with timestamps

Technical Details

Built using:
- React + TypeScript
- Framer Code Components
- Keplr Wallet Integration
- DAO DAO API Integration

Usage

1. Open your Framer project
2. Add a new Code component
3. Create a new component (TreasuryWidget or ProposalsWidget)
4. Paste the respective code
5. Deploy and enjoy real-time DAO interactions

Configuration

The widgets connect to:
- Chain ID: osmosis-1
- Base URL: https://indexer.daodao.zone
- DAO Address: osmo1sy9k228qzke0nd3k3vmxdvr68xdlqsu66h3xgm9ke3c4jhamusvsz98pre

Development

These widgets are designed to be modular and extensible. Each widget maintains its own state and handles its own data fetching, while sharing common utilities and types.

Contributing

Feel free to fork and submit pull requests. The codebase is structured for easy maintenance and enhancement.

License

cc0 License

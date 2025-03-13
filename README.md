# BoardGame Beats

BoardGame Beats is a web application that generates personalized Spotify playlists based on board game atmospheres. Using AI, it creates the perfect soundtrack for your board game sessions.

## Features

- Search for board games from the BoardGameGeek database
- Customize atmosphere settings (tempo, energy, complexity, mood, etc.)
- Generate AI-powered music recommendations
- Create and save Spotify playlists
- Light and dark mode support

## Tech Stack

- Next.js 14.1.0 with App Router
- TypeScript
- Chakra UI for styling
- NextAuth.js for authentication with Spotify
- Spotify Web API for music integration
- BoardGameGeek API for board game data
- OVHcloud AI for music recommendations

## Getting Started

### Prerequisites

- Node.js 18.17.0 or later
- Spotify Developer Account
- OVHcloud AI account (for AI recommendations)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/boardgame-beats.git
cd boardgame-beats
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

Copy the `.env.example` file to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

You'll need to provide:
- Spotify API credentials (client ID and secret)
- NextAuth secret and URL
- OVHcloud AI endpoint URL and API key

### Spotify API Setup

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Create a new application
3. Set the redirect URI to `http://localhost:3000/api/auth/callback/spotify`
4. Copy the Client ID and Client Secret to your `.env.local` file

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Troubleshooting

### Authentication Issues

- Make sure your Spotify API credentials are correct
- Check that the redirect URI in your Spotify Developer Dashboard matches exactly
- Verify that your NextAuth secret is set properly

### API Rate Limiting

- BoardGameGeek API has rate limiting, so you might need to implement caching
- Spotify API also has rate limits, check their documentation for details

### Environment Variables

- If you're getting "Missing environment variable" errors, make sure all required variables are set in your `.env.local` file
- Remember that changes to environment variables require a server restart

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [BoardGameGeek](https://boardgamegeek.com/) for their comprehensive board game database
- [Spotify](https://www.spotify.com/) for their music API
- [OVHcloud](https://www.ovhcloud.com/) for AI capabilities

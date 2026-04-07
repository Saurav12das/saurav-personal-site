import { ImageResponse } from '@vercel/og';

export const config = {
  runtime: 'edge',
};

// Font URLs from Google Fonts open-source repository
const SPECTRAL_SEMIBOLD_URL =
  'https://github.com/google/fonts/raw/main/ofl/spectral/Spectral-SemiBold.ttf';
const DM_MONO_URL =
  'https://github.com/google/fonts/raw/main/ofl/dmmono/DMMono-Medium.ttf';

export default async function handler(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const title =
      searchParams.get('title')?.slice(0, 200) ?? 'Saurav Das';
    const kicker =
      searchParams.get('kicker')?.slice(0, 80) ?? 'Essay';
    const author =
      searchParams.get('author')?.slice(0, 80) ?? 'Saurav Das';

    // Load fonts in parallel
    const [spectral, dmMono] = await Promise.all([
      fetch(SPECTRAL_SEMIBOLD_URL).then((r) => r.arrayBuffer()),
      fetch(DM_MONO_URL).then((r) => r.arrayBuffer()),
    ]);

    // Adaptive title size based on length
    const titleLength = title.length;
    const titleSize =
      titleLength > 100 ? 56 : titleLength > 70 ? 64 : titleLength > 40 ? 76 : 88;

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            background: '#faf8f4',
            padding: '80px 90px',
            justifyContent: 'space-between',
            fontFamily: 'Spectral',
            position: 'relative',
          }}
        >
          {/* Top accent bar */}
          <div
            style={{
              display: 'flex',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '8px',
              background: '#8b2e12',
            }}
          />

          {/* Kicker */}
          <div
            style={{
              display: 'flex',
              fontFamily: 'DM Mono',
              fontSize: 22,
              color: '#8b2e12',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {kicker}
          </div>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              fontSize: titleSize,
              color: '#1a1814',
              lineHeight: 1.08,
              letterSpacing: '-0.015em',
              maxWidth: '1020px',
            }}
          >
            {title}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: '120px',
                height: '2px',
                background: '#1a1814',
                marginBottom: '14px',
              }}
            />
            <div
              style={{
                display: 'flex',
                fontFamily: 'DM Mono',
                fontSize: 22,
                color: '#1a1814',
                letterSpacing: '0.04em',
              }}
            >
              {author}
            </div>
            <div
              style={{
                display: 'flex',
                fontFamily: 'DM Mono',
                fontSize: 18,
                color: '#7a756a',
                letterSpacing: '0.04em',
              }}
            >
              sauravdas.me
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Spectral',
            data: spectral,
            style: 'normal',
            weight: 600,
          },
          {
            name: 'DM Mono',
            data: dmMono,
            style: 'normal',
            weight: 500,
          },
        ],
      }
    );
  } catch (e: any) {
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    });
  }
}

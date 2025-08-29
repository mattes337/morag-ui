import { NextRequest, NextResponse } from 'next/server';

/**
 * Test endpoint to isolate YouTube URL corruption issue
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log(`🔍 [URL Test] Testing URL corruption with: ${url}`);

    // Test 1: Basic JSON serialization
    const test1Array = [url];
    const test1Json = JSON.stringify(test1Array);
    const test1Parsed = JSON.parse(test1Json);

    // Test 2: Metadata object serialization (like job metadata)
    const test2Metadata = {
      sourceUrl: url,
      documentType: 'youtube',
      documentSubType: null
    };
    const test2Json = JSON.stringify(test2Metadata);
    const test2Parsed = JSON.parse(test2Json);

    // Test 3: FormData simulation (like backend API call)
    const formData = new FormData();
    formData.append('input_files', JSON.stringify([url]));
    const test3Value = formData.get('input_files') as string;
    const test3Parsed = JSON.parse(test3Value);

    // Test 4: URL encoding/decoding
    const test4Encoded = encodeURIComponent(url);
    const test4Decoded = decodeURIComponent(test4Encoded);

    const results = {
      original: url,
      originalLength: url.length,
      tests: {
        jsonArray: {
          serialized: test1Json,
          parsed: test1Parsed[0],
          matches: url === test1Parsed[0],
          lengthDiff: url.length - test1Parsed[0].length
        },
        metadata: {
          serialized: test2Json,
          parsed: test2Parsed.sourceUrl,
          matches: url === test2Parsed.sourceUrl,
          lengthDiff: url.length - test2Parsed.sourceUrl.length
        },
        formData: {
          serialized: test3Value,
          parsed: test3Parsed[0],
          matches: url === test3Parsed[0],
          lengthDiff: url.length - test3Parsed[0].length
        },
        urlEncoding: {
          encoded: test4Encoded,
          decoded: test4Decoded,
          matches: url === test4Decoded,
          lengthDiff: url.length - test4Decoded.length
        }
      }
    };

    // Character-by-character analysis for any mismatches
    const analyses: any = {};
    Object.entries(results.tests).forEach(([testName, testResult]) => {
      if (!testResult.matches) {
        const analysis: any = {
          differences: []
        };
        
        const compared = testResult.parsed;
        for (let i = 0; i < Math.max(url.length, compared.length); i++) {
          const orig = url[i] || 'EOF';
          const comp = compared[i] || 'EOF';
          if (orig !== comp) {
            analysis.differences.push({
              position: i,
              original: orig,
              compared: comp,
              originalCharCode: orig === 'EOF' ? null : orig.charCodeAt(0),
              comparedCharCode: comp === 'EOF' ? null : comp.charCodeAt(0)
            });
          }
        }
        analyses[testName] = analysis;
      }
    });

    if (Object.keys(analyses).length > 0) {
      results.analyses = analyses;
    }

    console.log(`🔍 [URL Test] Results:`, JSON.stringify(results, null, 2));

    return NextResponse.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('URL corruption test failed:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Function to make requests to Netlify Functions
async function callNetlifyFunction(action: string, payload?: any) {
  try {
    const response = await fetch('/.netlify/functions/supabase-client', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, payload })
    });

    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Get response text first
    const text = await response.text();
    
    // Only try to parse if we have content
    if (text) {
      try {
        const data = JSON.parse(text);
        return data;
      } catch (e) {
        console.error('Failed to parse JSON response:', text);
        throw new Error('Invalid JSON response');
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error calling Netlify function:', error);
    throw error;
  }
}

export { callNetlifyFunction };
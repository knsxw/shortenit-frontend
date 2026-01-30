
export async function fetchMicrosoftProfileImage(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me/photo/$value", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
        // It's common for users to not have a photo, returns 404
        if (response.status === 404) {
            return null;
        }
        console.warn("Failed to fetch Microsoft profile image", response.status, response.statusText);
        return null;
    }

    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error fetching Microsoft profile image:", error);
    return null;
  }
}

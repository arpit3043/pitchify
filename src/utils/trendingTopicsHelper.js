export const extractHashtags = (content) => {
  const hashtags = content.match(/#\b[a-zA-Z0-9_]{2,}\b/g) || []; 
  return [...new Set(hashtags.map((tag) => tag.toLowerCase()))];
};

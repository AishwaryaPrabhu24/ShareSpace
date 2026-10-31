
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def recommend_resources(
    search_query: str,
    resources: list,
    top_n: int = 5
):
    """
    Recommend resources based on text similarity.

    Parameters:
        search_query: User's search requirement.
        resources: List of resource objects.
        top_n: Maximum number of recommendations.

    Returns:
        Ranked list of matching resources with similarity scores.
    """

    if not search_query or not search_query.strip():
        return []

    if not resources:
        return []

    # Prepare resource descriptions
    resource_texts = []

    for resource in resources:

        text = " ".join([
            resource.name or "",
            resource.category or "",
            resource.description or "",
            resource.location or ""
        ])

        resource_texts.append(text)

    # Combine user query and resource descriptions
    documents = [search_query] + resource_texts

    # Convert text into TF-IDF numerical vectors
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2)
    )

    try:
        tfidf_matrix = vectorizer.fit_transform(documents)

    except ValueError:
        return []

    # Calculate cosine similarity
    similarity_scores = cosine_similarity(
        tfidf_matrix[0:1],
        tfidf_matrix[1:]
    ).flatten()

    # Rank resources by similarity
    ranked_indices = similarity_scores.argsort()[::-1]

    recommendations = []

    for index in ranked_indices[:top_n]:

        score = float(similarity_scores[index])

        if score <= 0:
            continue

        resource = resources[index]

        recommendations.append({
            "resource_id": resource.id,
            "name": resource.name,
            "category": resource.category,
            "description": resource.description,
            "location": resource.location,
            "similarity_score": round(score * 100, 2)
        })

    return recommendations

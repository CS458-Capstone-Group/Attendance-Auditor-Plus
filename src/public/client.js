function updateEntry(userId, eventId) {
    fetch("/events/" + eventId + "/attendance/" + userId, {
        method: "POST"
    });
}
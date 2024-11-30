function submitComment(event) {
    event.preventDefault(); // Prevent page refresh

    const name = document.getElementById('name').value;
    const comment = document.getElementById('comment').value;

    // Create a new comment element
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.innerHTML = `<strong>${name}</strong>: ${comment}`;

    // Append the new comment to the comment list
    document.getElementById('comment-list').appendChild(commentElement);

    // Clear the form fields
    document.getElementById('name').value = '';
    document.getElementById('comment').value = '';
}

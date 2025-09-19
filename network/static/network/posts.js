document.addEventListener('DOMContentLoaded', function() {

    getPosts("all", 1);

    // Handle new post form submission
    const createPostForm = document.querySelector('#create_post');
    if (createPostForm) {
        createPostForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const content = document.querySelector('textarea[name="content"]').value;
            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            if (!content.trim()) {
                alert('Please enter some content for your post.');
                return;
            }

            fetch('/new_post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                body: JSON.stringify({post: content})
            })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error);
                } else {
                    document.querySelector('textarea[name="content"]').value = '';
                    getPosts("all", 1);
                }
            })
            .catch(error => {
                console.error('Error creating post:', error);
                alert('Failed to create post. Please try again.');
            });
        });
    }

    // Navigation links
    document.querySelector("#all-link").addEventListener("click", (e) => {
        e.preventDefault();
        showPostsView();
        getPosts("all", 1);
    });

    document.querySelector("#following-link").addEventListener("click", (e) => {
        e.preventDefault();
        showPostsView();
        getFollowingPosts(1);
    });

    // Profile link delegation
    document.addEventListener('click', function(e) {
        if (e.target.closest('.profile-link')) {
            e.preventDefault();
            const profileLink = e.target.closest('.profile-link');
            if (profileLink.classList.contains('nav-item') || profileLink.closest('.navbar')) {
                loadProfile(profileLink.innerText.trim());
            } else if (profileLink.dataset.username) {
                loadProfile(profileLink.dataset.username);
            }
        }
    });

    function showPostsView() {
        document.querySelector('#all_posts').style.display = 'block';
        document.querySelector('#profile-view').style.display = 'none';
        const newPostDiv = document.querySelector('#new_post');
        if (newPostDiv && document.querySelector('[name=csrfmiddlewaretoken]')) {
            newPostDiv.style.display = 'block';
        }
    }

    function getFollowingPosts(page = 1) {
        fetch(`/following?page=${page}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
        .then(response => {
            if (response.status === 401) {
                alert('Please log in to view posts from users you follow.');
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                displayPosts(data, "following");
            }
        })
        .catch(error => {
            console.error('Error fetching following posts:', error);
        });
    }

    function loadProfile(username) {
        fetch(`/profile/${username}`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
        })
        .then(response => response.json())
        .then(data => {
            document.querySelector('#all_posts').style.display = 'block';
            document.querySelector('#new_post').style.display = 'none';
            document.querySelector('#profile-view').style.display = 'block';

            document.querySelector('#profile-username').innerText = data.profile_username;
            document.querySelector('#follower-count').innerText = data.followers_count;
            document.querySelector('#following-count').innerText = data.following_count;

            const followBtn = document.querySelector('#follow-btn');
            followBtn.innerText = data.is_following ? "Unfollow" : "Follow";
            const currentUsername = document.querySelector(".profile-link").innerText.trim();
            followBtn.style.display = data.profile_username === currentUsername ? 'none' : 'block';

            const newFollowBtn = followBtn.cloneNode(true);
            followBtn.parentNode.replaceChild(newFollowBtn, followBtn);

            newFollowBtn.addEventListener('click', () => {
                fetch(`/follow/${data.profile_username}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': document.querySelector('[name=csrfmiddlewaretoken]').value
                    }
                })
                .then(response => response.json())
                .then(followData => {
                    document.querySelector('#follower-count').innerText = followData.followers_count;
                    document.querySelector('#following-count').innerText = followData.following_count;
                    newFollowBtn.innerText = followData.is_following ? "Unfollow" : "Follow";
                })
                .catch(error => {
                    console.error('Error toggling follow status:', error);
                });
            });

            getPosts("profile", 1, data.profile_username);
        })
        .catch(error => {
            console.error('Error loading profile:', error);
        });
    }

    function getPosts(feed = "all", page = 1, username = null) {
        let url = `/posts?feed=${feed}&page=${page}`;
        if (feed === "profile" && username) {
            url += `&username=${username}`;
        }

        fetch(url)
        .then(response => {
            if (response.status === 401 && feed === "following") {
                alert('Please log in to view posts from users you follow.');
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                displayPosts(data, feed, username);
            }
        })
        .catch(error => {
            console.error('Error fetching posts:', error);
        });
    }

    function displayPosts(data, feed, username = null) {
        const posts = data.posts;
        const container = document.querySelector('#all_posts');

        if (posts.length === 0) {
            let msg;
            switch(feed) {
                case 'following':
                    msg = "No posts yet from users you follow.";
                    break;
                case 'profile':
                    msg = "This user hasn't posted anything yet.";
                    break;
                default:
                    msg = "No posts available. Be the first to add a post!";
            }
            container.innerHTML = `<p>${msg}</p>`;
            return;
        }

        container.innerHTML = '';
        posts.forEach(post => {
            const postElement = document.createElement('div');
            postElement.className = 'post-item';
            postElement.id = `post-${post.id}`;

            postElement.innerHTML = `
                <a href="#" class="profile-link" data-username="${post.author}"><strong>${post.author}</strong></a>
                <p class="content">${post.content}</p>
                <small class="timestamp">${dayjs(post.created_at).fromNow()}</small>
            `;

        // Add like button + count
        if (data.is_authenticated) {
            const likeWrapper = document.createElement('div');
            likeWrapper.className = "like-wrapper";

            const likeBtn = document.createElement('button');
            likeBtn.className = 'like-btn';
            likeBtn.innerHTML = post.liked 
                ? `<i class="fas fa-heart like-icon liked"></i>` 
                : `<i class="far fa-heart like-icon"></i>`;

            const likeCount = document.createElement('span');
            likeCount.id = `likes_${post.id}`;
            likeCount.className = "likes-count";
            likeCount.textContent = post.likes;

            likeBtn.addEventListener('click', () => {
                likePost(post.id, likeBtn, likeCount);
            });

            likeWrapper.appendChild(likeBtn);
            likeWrapper.appendChild(likeCount);
            postElement.appendChild(likeWrapper);
        }

            if (post.is_author) {
                const editBtn = document.createElement('button');
                editBtn.className = "edit-btn";
                editBtn.dataset.id = post.id;
                editBtn.innerText = "Edit";
                
                const deleteBtn = document.createElement('button');
                deleteBtn.className = "delete-btn";
                deleteBtn.dataset.id = post.id;
                deleteBtn.innerText = "Delete";

                deleteBtn.addEventListener('click', function() {
                    if (confirm("Are you sure you want to delete this post?")) {
                        deletePost(post.id);
                    }
                });

                editBtn.addEventListener('click', function() {
                    const currentContent = postElement.querySelector('.content');
                    const oldContent = currentContent.innerText;
                    currentContent.innerHTML = `
                        <textarea class="edit-textarea">${oldContent}</textarea>
                        <button class="save-btn">Save</button>
                        <button class="cancel-btn">Cancel</button>
                    `;
                    currentContent.querySelector('.save-btn').addEventListener('click', () => {
                        const newContent = currentContent.querySelector('.edit-textarea').value;
                        editPost(post.id, newContent);
                    });
                    currentContent.querySelector('.cancel-btn').addEventListener('click', () => {
                        currentContent.innerText = oldContent;
                    });
                });

                postElement.appendChild(editBtn);
                postElement.appendChild(deleteBtn);
            }

            container.appendChild(postElement);
        });

        createPaginationControls(container, data, feed, username);
    }

    function createPaginationControls(container, data, feed, username) {
        const paginationDiv = document.createElement('div');
        paginationDiv.className = "pagination";

        if (data.has_previous) {
            const prevBtn = document.createElement('button');
            prevBtn.className = "pagination-btn";
            prevBtn.innerText = "Previous";
            prevBtn.addEventListener('click', () => {
                if (feed === "following") {
                    getFollowingPosts(data.page_number - 1);
                } else {
                    getPosts(feed, data.page_number - 1, username);
                }
            });
            paginationDiv.appendChild(prevBtn);
        }

        if (data.has_next) {
            const nextBtn = document.createElement('button');
            nextBtn.className = "pagination-btn";
            nextBtn.innerText = "Next";
            nextBtn.addEventListener('click', () => {
                if (feed === "following") {
                    getFollowingPosts(data.page_number + 1);
                } else {
                    getPosts(feed, data.page_number + 1, username);
                }
            });
            paginationDiv.appendChild(nextBtn);
        }

        if (data.num_pages > 1) {
            const pageInfo = document.createElement('span');
            pageInfo.className = "page-info";
            pageInfo.innerText = `Page ${data.current_page} of ${data.num_pages}`;
            paginationDiv.appendChild(pageInfo);
        }

        container.appendChild(paginationDiv);
    }

    function likePost(postId, button, countEl) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        fetch(`/like/${postId}`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json','X-CSRFToken': csrfToken}
        })
        .then(response => response.json())
        .then(data => {
            countEl.textContent = data.likes;
            button.innerHTML = data.liked 
                ? `<i class="fas fa-heart like-icon liked"></i>` 
                : `<i class="far fa-heart like-icon"></i>`;
        })
            .catch(error => {
                console.error('Error toggling like:', error);
            });
    }

    function editPost(postId, newContent) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        fetch(`/edit/${postId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({post: newContent})
        })
        .then(response => response.json())
        .then(data => {
            document.querySelector(`#post-${postId} .content`).innerText = data.content;
        })
        .catch(error => {
            console.error('Error editing post:', error);
            getPosts("all", 1);
        });
    }

    function deletePost(postId) {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        fetch(`/delete/${postId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        })
        .then(response => response.json())
        .then(() => {
            const postElement = document.querySelector(`#post-${postId}`);
            if (postElement) {
                postElement.remove();
            }
        })
        .catch(error => {
            console.error('Error deleting post:', error);
        });
    }

});

$(document).ready(function() {
    let albumToDelete = null;
    let imageToDelete = null;

    // Função para adicionar álbuns ao DOM
    function addAlbumToDOM(album) {
        const albumHTML = `
            <div class="col-md-3">
                <div class="card album-card" onclick="viewAlbum('${album.name}')">
                    <div class="card-body">
                        <h5 class="card-title">${album.name}</h5>
                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="showAddPhotoModal('${album.name}'); event.stopPropagation();"><i class="fa-solid fa-plus"></i></button>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteAlbum(event, '${album.name}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
        $('#albumContainer').append(albumHTML);
    }

    // Função para carregar álbuns do Local Storage
    function loadAlbums() {
        let albums = JSON.parse(localStorage.getItem('albums')) || [];
        albums.forEach(album => addAlbumToDOM(album));
    }

    // Função para exibir o álbum selecionado
    window.viewAlbum = function(albumName) {
        const albums = JSON.parse(localStorage.getItem('albums')) || [];
        const album = albums.find(a => a.name === albumName);

        if (album) {
            let albumContentHTML = '';
            let rowHTML = '<div class="row">'; // Inicia uma nova linha

            if (album.images.length) {
                album.images.forEach((img, index) => {
                    rowHTML += `
                        <div class="col-12 col-sm-6 col-md-4 mb-3">
                            <div class="card album-card">
                                <img class="card-img-top" src="${img.image}" alt="Photo" onclick="showImage('${albumName}', ${index})">
                            </div>
                        </div>
                    `;
                    // Fecha a linha a cada 3 colunas e inicia uma nova linha
                    if ((index + 1) % 3 === 0) {
                        rowHTML += '</div><div class="row">';
                    }
                });
                // Fecha a última linha aberta
                rowHTML += '</div>';
            } else {
                albumContentHTML = '<p>Este álbum está vazio.</p>';
            }

            $('#albumContent').html(albumContentHTML + rowHTML);
            $('#albumModalTemplate').modal('show');

            // Configurar o botão "Adicionar Foto" para abrir o modal de adicionar fotos
            $('#addPhotoToAlbumBtn').off('click').on('click', function() {
                $('#addPhotoModal').data('albumName', albumName);
                $('#addPhotoModal').modal('show');
            });
        } else {
            $('#albumContent').html('<p>Álbum não encontrado.</p>');
            $('#albumModalTemplate').modal('show');
        }
    };

    
    
    // Função para exibir o modal de adicionar fotos
    window.showAddPhotoModal = function(albumName) {
        $('#addPhotoModal').data('albumName', albumName);
        $('#addPhotoModal').modal('show');
    };

    // Função para exibir o modal de visualização de imagens
    window.showImage = function(albumName, imageIndex) {
        const albums = JSON.parse(localStorage.getItem('albums')) || [];
        const album = albums.find(a => a.name === albumName);

        if (album && album.images[imageIndex]) {
            const imageUrl = album.images[imageIndex].image;

            $('#viewImage').attr('src', imageUrl);
            $('#deleteImageBtn').off('click').on('click', function() {
                deleteImage(albumName, imageIndex);
            });
            $('#viewImageModal').modal('show');
        }
    };

    // Função para excluir uma imagem de um álbum
    function deleteImage(albumName, imageIndex) {
        let albums = JSON.parse(localStorage.getItem('albums')) || [];
        const album = albums.find(a => a.name === albumName);

        if (album) {
            album.images.splice(imageIndex, 1);
            localStorage.setItem('albums', JSON.stringify(albums));

            // Atualizar o conteúdo do álbum no DOM
            viewAlbum(albumName);
            $('#viewImageModal').modal('hide');
        } else {
            alert("Álbum não encontrado.");
        }
    }

    // Manipulador de envio do formulário de adicionar foto
    $('#addPhotoForm').on('submit', function(e) {
        e.preventDefault();
        const fileInput = $('#photoInput')[0];
        const albumName = $('#addPhotoModal').data('albumName');

        if (!fileInput.files.length || !albumName) {
            alert("Nenhuma foto selecionada ou nome do álbum não está definido.");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const photoUrl = e.target.result;

            let albums = JSON.parse(localStorage.getItem('albums')) || [];
            const album = albums.find(a => a.name === albumName);
            if (album) {
                album.images.push({ image: photoUrl });
                localStorage.setItem('albums', JSON.stringify(albums));

                // Atualizar o conteúdo do álbum no DOM
                const albumContentHTML = album.images.map(img => `
                    <div class="col-md-4 mb-3">
                        <div class="card album-card">
                            <img class="card-img-top" src="${img.image}" alt="Photo" onclick="showImage('${albumName}', ${album.images.indexOf(img)})">
                        </div>
                    </div>
                `).join('');
                $('#albumContent').html(albumContentHTML);

                $('#addPhotoModal').modal('hide');
            } else {
                alert("Álbum não encontrado.");
            }
        };
        reader.readAsDataURL(fileInput.files[0]);
    });

    // Manipulador para exibir a imagem de pré-visualização
    $('#photoInput').on('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                $('#previewImage').attr('src', e.target.result).show();
            };
            reader.readAsDataURL(file);
        } else {
            $('#previewImage').attr('src', '').hide();
        }
    });

    // Função para excluir um álbum
    window.deleteAlbum = function(event, albumName) {
        event.stopPropagation();
        albumToDelete = albumName;
        $('#confirmDeleteAlbumModal').modal('show');
    };

    // Função para confirmar a exclusão de um álbum
    $('#confirmDeleteAlbumBtn').on('click', function() {
        if (albumToDelete) {
            let albums = JSON.parse(localStorage.getItem('albums')) || [];
            albums = albums.filter(a => a.name !== albumToDelete);
            localStorage.setItem('albums', JSON.stringify(albums));
            $('#albumContainer').empty();
            loadAlbums();
            $('#confirmDeleteAlbumModal').modal('hide');
            albumToDelete = null;
        }
    });

    // Função para exibir o modal de confirmação de exclusão de imagem
    window.deleteImage = function(albumName, imageIndex) {
        const albums = JSON.parse(localStorage.getItem('albums')) || [];
        const album = albums.find(a => a.name === albumName);

        if (album && album.images[imageIndex]) {
            imageToDelete = { albumName, imageIndex };
            $('#confirmDeleteImageModal').modal('show');
        }
    };

    // Função para confirmar a exclusão de uma imagem
    $('#confirmDeleteImageBtn').on('click', function() {
        if (imageToDelete) {
            const { albumName, imageIndex } = imageToDelete;
            let albums = JSON.parse(localStorage.getItem('albums')) || [];
            const album = albums.find(a => a.name === albumName);

            if (album) {
                album.images.splice(imageIndex, 1);
                localStorage.setItem('albums', JSON.stringify(albums));

                // Atualizar o conteúdo do álbum no DOM
                viewAlbum(albumName);
                $('#viewImageModal').modal('hide');
                $('#confirmDeleteImageModal').modal('hide');
                imageToDelete = null;
            } else {
                alert("Álbum não encontrado.");
            }
        }
    });

    // Manipulador de envio do formulário de criação de álbum
    $('#createAlbumForm').on('submit', function(e) {
        e.preventDefault();
        const albumName = $('#albumName').val().trim();

        if (!albumName) {
            alert("O nome do álbum não pode estar vazio.");
            return;
        }

        let albums = JSON.parse(localStorage.getItem('albums')) || [];
        
        // Verificar se já existe um álbum com o mesmo nome
        if (albums.some(a => a.name.toLowerCase() === albumName.toLowerCase())) {
            alert("Já existe um álbum com esse nome.");
            return;
        }

        albums.push({ name: albumName, images: [] });
        localStorage.setItem('albums', JSON.stringify(albums));
        addAlbumToDOM({ name: albumName, images: [] });
        $('#createAlbumModal').modal('hide');
    });
    // Função para adicionar álbuns ao DOM
    function addAlbumToDOM(album) {
        // Defina uma imagem padrão se não houver imagens no álbum
        const previewImage = album.images.length > 0 ? album.images[0].image : 'img/default-album.png';

        const albumHTML = `
            <div class="col-md-3">
                <div class="card album-card" onclick="viewAlbum('${album.name}')">
                    <img class="card-img-top" src="${previewImage}" alt="Preview" />
                    <div class="card-body">
                        <h5 class="card-title">${album.name}</h5>
                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="showAddPhotoModal('${album.name}'); event.stopPropagation();"><i class="fa-solid fa-plus"></i></button>
                        <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteAlbum(event, '${album.name}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
        $('#albumContainer').append(albumHTML);
    }
    // Função para exibir o álbum selecionado
    window.viewAlbum = function(albumName) {
        const albums = JSON.parse(localStorage.getItem('albums')) || [];
        const album = albums.find(a => a.name === albumName);

        if (album) {
            let albumContentHTML = '';
            if (album.images.length) {
                albumContentHTML = album.images.map((img, index) => `
                    <div class="col-md-4 mb-3">
                        <div class="card album-card">
                            <img class="card-img-top" src="${img.image}" alt="Photo" onclick="showImage('${albumName}', ${index})">
                        </div>
                    </div>
                `).join('');
            } else {
                albumContentHTML = '<p>Este álbum está vazio.</p>';
            }

            $('#albumContent').html(albumContentHTML);
            $('#albumModalTemplate').modal('show');

            // Configurar o botão "Adicionar Foto" para abrir o modal de adicionar fotos
            $('#addPhotoToAlbumBtn').off('click').on('click', function() {
                $('#addPhotoModal').data('albumName', albumName);
                $('#addPhotoModal').modal('show');
            });

            // Atualizar a pré-visualização do álbum
            const previewImage = album.images.length > 0 ? album.images[0].image : 'img/default-album.png';
            $(`.album-card img[src='${previewImage}']`).attr('src', previewImage);
        } else {
            $('#albumContent').html('<p>Álbum não encontrado.</p>');
            $('#albumModalTemplate').modal('show');
        }
    };



    // Carregar álbuns ao carregar a página
    loadAlbums();
});


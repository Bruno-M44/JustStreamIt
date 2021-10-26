class Carousel {

  /**
   * 
   * @param {HTMLElement} element 
   * @param {Object} options 
   * @param {Object} [options.slidesToScroll=1] Nombre d'éléments à faire défiler
   * @param {Object} [options.slidesVisible=1] Nombre d'éléments visible dans un slide
   * @param {Object} [options.url="http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes"] Requête URL
   * @param {Object} [options.startPosition=0] Position du 1er élément qui doit être retourné par la requête API
   * @param {Object} [option.headliner=False] Afficher un film en en-tête
   */
  constructor (element, options = {}) {
    this.element = element
    this.options = Object.assign({}, {
      slidesToScroll: 2,
      slidesVisible: 4,
      url: "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes",
      startPosition: 0,
      headliner: false
    }, options)
    this.callFetch(this.options.url).then(value => {
      if (this.options.headliner) {
        this.callFetch(value.results[0].url).then(value2 => {
          let headliner = document.querySelector("#best_movie")

          let leftBlock = document.createElement("div")
          leftBlock.classList.add("left_block")
          
          let title = document.createElement("h2")
          title.textContent = value2.title
          leftBlock.appendChild(title)

          let button = document.createElement("button")
          button.textContent = "Play"
          leftBlock.appendChild(button)
          headliner.appendChild(leftBlock)
          this.modalBtn(button, value2)

          let rightBlock = document.createElement("div")
          rightBlock.classList.add("right_block")
          
          let newPicture = document.createElement("img")
          newPicture.src = value2.image_url
          rightBlock.appendChild(newPicture)
          headliner.appendChild(rightBlock)
        })
      }
  
      let children = []
      for (let iSlide = 0; iSlide < 7; iSlide++) {
        if (iSlide + this.options.startPosition < 5) {
          children[iSlide] = this.setItem(value, iSlide, 0)
        } else {
          this.callFetch(value.next).then(value2 => {
            if (iSlide + this.options.startPosition < 10) {
              children[iSlide] = this.setItem(value2, iSlide, 5)
              if (iSlide == 6) {
                this.setInstanceCarousel(children)  
                this.modal()
              }
            }else {
              this.callFetch(value2.next).then(value3 => {
                children[iSlide] = this.setItem(value3, iSlide, 10)
                if (iSlide == 6) {
                  this.setInstanceCarousel(children)
                }
            })
            }

          })
        }
      }
    })
  }

  
  /**
   * 
   * @param {string} url 
   * @returns 
   */
  async callFetch(url) {
    try {
      const response = await fetch(url)
      return await response.json()
    } catch (err) {
      return console.log("Problem with fetch:" + err)
    }
  }
  
  /**
   * Affiche le carrousel qui a été chargé
   */
   setInstanceCarousel(children) {
    this.currentItem = 0
    this.root = this.createDivWithClass("carousel")
    this.container = this.createDivWithClass("carousel__container")
    this.root.appendChild(this.container)
    this.element.appendChild(this.root)
    this.items = children.map((child) => {
      let item = this.createDivWithClass("carousel__item")
      item.appendChild(child)
      return item
    })
    this.items.forEach(item => this.container.appendChild(item))
    this.setStyle()
    this.createNavigation()
  }

  /**
   * Créé un item du carrousel
   * @param {Object} value
   * @param {Number} value
   * @param {Number} removal Retrait afin de rester sur la page de l'API qui est lue 
   * @returns {HTMLElement}
   */
  setItem (value, iSlide, removal) {
    let child = this.createDivWithClass("item")
    let grandChild = child.appendChild(this.createDivWithClass("item__image"))
    grandChild.id = value.results[iSlide + this.options.startPosition - removal].id
    let newPicture = document.createElement("img")
    newPicture.src = value.results[iSlide + this.options.startPosition - removal].image_url
    grandChild.appendChild(newPicture)
    return child
  }

  /**
   * Applique les bonnes dimensions aux éléments du carrousel
   */
  setStyle () {
    let ratio = this.items.length / this.options.slidesVisible
    this.container.style.width = (ratio * 100) + "%"
    this.items.forEach(item => item.style.width = ((100 / this.options.slidesVisible) / ratio) + "%")
  }

  createNavigation () {
    let nextButton = this.createDivWithClass("carousel__next")
    let prevButton = this.createDivWithClass("carousel__prev")
    this.root.appendChild(nextButton)
    this.root.appendChild(prevButton)

    nextButton.addEventListener("click", this.next.bind(this))
    prevButton.addEventListener("click", this.prev.bind(this))
  }

  next () {
    this.gotoItem(this.currentItem + this.options.slidesToScroll)

  }

  prev () {
    this.gotoItem(this.currentItem - this.options.slidesToScroll)
  }

  /**
   * Déplace le carrousel vers l'élément ciblé
   * @param {number} index 
   */
  gotoItem (index) {
    if (index < 0) {
      index = 3
    } else if (index >= 4) {
      index = 0
    }
    let translateX = index * -100 / this.items.length
    this.container.style.transform = "translate3d(" + translateX + "%, 0, 0)"
    this.currentItem = index
  }

  /**
   * 
   * @param {string} className 
   * @returns {HTMLElement}
   */
  createDivWithClass (className) {
    let div = document.createElement("div")
    div.setAttribute("class", className)
    return div

  }

  /**
   * Ouverture de la fenêtre modale du film sélectionné
   */
  modal () {
    let thisUpper = this
    let modal = document.querySelector("aside")
    let items = document.querySelectorAll(".item")
      for (let iItem = 0; iItem < items.length; iItem++) {
        items[iItem].onclick = function() {
          let modalContent = document.createElement("div")
          modalContent.classList.add("modal-content")
          let url = "http://localhost:8000/api/v1/titles/" + items[iItem].children[0].id
          thisUpper.callFetch(url).then(value => {
            let closeButton = document.createElement("span")
            closeButton.classList.add("close")
            closeButton.textContent = "x"
            modalContent.appendChild(closeButton)
            
            let newPicture = document.createElement("img")
            newPicture.src = value.image_url
            modalContent.appendChild(newPicture)

            let title = document.createElement("h3")
            title.textContent = value.title
            modalContent.appendChild(title)

            let genres = document.createElement("p")
            genres.textContent = "Genres : " + value.genres
            modalContent.appendChild(genres)

            let datePublished = document.createElement("p")
            datePublished.textContent = "Date de sortie : " + value.date_published
            modalContent.appendChild(datePublished)

            let rated = document.createElement("p")
            rated.textContent = "Classification : " + value.rated
            modalContent.appendChild(rated)

            let imdbScore = document.createElement("p")
            imdbScore.textContent = "Score IMDB : " + value.imdb_score
            modalContent.appendChild(imdbScore)

            let directors = document.createElement("p")
            directors.textContent = "Réalisateur : " + value.directors
            modalContent.appendChild(directors)

            let actors = document.createElement("p")
            actors.textContent = "Acteurs : " + value.actors
            modalContent.appendChild(actors)

            let duration = document.createElement("p")
            duration.textContent = "Durée (min) : " + value.duration
            modalContent.appendChild(duration)

            let countries = document.createElement("p")
            countries.textContent = "Pays : " + value.countries
            modalContent.appendChild(countries)

            let worldwideGrossIncome = document.createElement("p")
            worldwideGrossIncome.textContent = "Résultat au box-office : " + value.worldwide_gross_income
            modalContent.appendChild(worldwideGrossIncome)

            let longDescription = document.createElement("p")
            longDescription.textContent = "Résumé : " + value.long_description
            modalContent.appendChild(longDescription)

            modal.appendChild(modalContent)

            modal.style.display = "block" 

            closeButton.onclick = function() {
              modal.style.display = "none"
              while (modal.firstChild) {
                modal.removeChild(modal.firstChild)
              }
            } 
        })
      }
    }
  }

  modalBtn (element, value) {
    let modal = document.querySelector("aside")
    element.onclick = function() {
    let modalContent = document.createElement("div")
    modalContent.classList.add("modal-content")

    let closeButton = document.createElement("span")
    closeButton.classList.add("close")
    closeButton.textContent = "x"
    modalContent.appendChild(closeButton)
            
    let newPicture = document.createElement("img")
    newPicture.src = value.image_url
    modalContent.appendChild(newPicture)

    let title = document.createElement("h3")
    title.textContent = value.title
    modalContent.appendChild(title)

    let genres = document.createElement("p")
    genres.textContent = "Genres : " + value.genres
    modalContent.appendChild(genres)

    let datePublished = document.createElement("p")
    datePublished.textContent = "Date de sortie : " + value.date_published
    modalContent.appendChild(datePublished)

    let rated = document.createElement("p")
    rated.textContent = "Classification : " + value.rated
    modalContent.appendChild(rated)

    let imdbScore = document.createElement("p")
    imdbScore.textContent = "Score IMDB : " + value.imdb_score
    modalContent.appendChild(imdbScore)

    let directors = document.createElement("p")
    directors.textContent = "Réalisateur : " + value.directors
    modalContent.appendChild(directors)

    let actors = document.createElement("p")
    actors.textContent = "Acteurs : " + value.actors
    modalContent.appendChild(actors)

    let duration = document.createElement("p")
    duration.textContent = "Durée (min) : " + value.duration
    modalContent.appendChild(duration)

    let countries = document.createElement("p")
    countries.textContent = "Pays : " + value.countries
    modalContent.appendChild(countries)

    let worldwideGrossIncome = document.createElement("p")
    worldwideGrossIncome.textContent = "Résultat au box-office : " + value.worldwide_gross_income
    modalContent.appendChild(worldwideGrossIncome)

    let longDescription = document.createElement("p")
    longDescription.textContent = "Résumé : " + value.long_description
    modalContent.appendChild(longDescription)

    modal.appendChild(modalContent)

    modal.style.display = "block" 

    closeButton.onclick = function() {
      modal.style.display = "none"
      while (modal.firstChild) {
        modal.removeChild(modal.firstChild)
      }
    }  
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {

  new Carousel(document.querySelector("#top_rated_movies"), {
    slidesVisible: 4,
    slidesToScroll: 1,
    startPosition: 1,
    headliner: true
  })

  new Carousel(document.querySelector("#top_rated_action_movies"), {
    slidesVisible: 4,
    slidesToScroll: 1,
    url: "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes&genre=Action"
  })

  new Carousel(document.querySelector("#top_rated_adventure_movies"), {
    slidesVisible: 4,
    slidesToScroll: 1,
    url: "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes&genre=Adventure"
  })

  new Carousel(document.querySelector("#top_rated_sci-fi_movies"), {
    slidesVisible: 4,
    slidesToScroll: 1,
    url: "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes&genre=Sci-Fi"
  })
  
})

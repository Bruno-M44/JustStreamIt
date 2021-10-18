class Carousel {

  /**
   * 
   * @param {HTMLElement} element 
   * @param {Object} options 
   * @param {Object} [options.slidesToScroll=1] Nombre d'éléments à faire défiler
   * @param {Object} [options.slidesVisible=1] Nombre d'éléments visible dans un slide
   * @param {Object} [options.url="http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes"] url API
   * @param {Object} [options.pageNumberAPI=1] Numéro de page de la requête API
   * @param {Object} [options.moviePositionAPI=0] Position du film au niveau de la page
   */
  constructor (element, options = {}) {
    this.element = element
    this.options = Object.assign({}, {
      slidesToScroll: 1,
      slidesVisible: 1,
      url: "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes",
      pageNumberAPI: 1,
      moviePositionAPI: 0
    }, options)
    this.showCurrentItems()
    }

  /**
   * Renvoie les films à afficher
   */
  showCurrentItems() {
    this.callFetch(this.options.url).then(value => {
      let children = []
      for (let iSlide = 0; iSlide < this.options.slidesVisible; iSlide++) {
        if (iSlide + this.options.moviePositionAPI < 5) {
          children[iSlide] = this.setItem(value, iSlide, 0)
          if (iSlide == this.options.slidesVisible - 1) {
            this.setInstanceCarousel(children)
          }
        } else {
          this.callFetch(value.next).then(value2 => {
            if (iSlide + this.options.moviePositionAPI < 10) {
              children[iSlide] = this.setItem(value2, iSlide, 5)
              if (iSlide == this.options.slidesVisible - 1) {
                this.setInstanceCarousel(children)
            }
            }
            if (iSlide + this.options.moviePositionAPI >= 10) {
              this.callFetch(value2.next).then(value3 => {
                children[iSlide] = this.setItem(value3, iSlide, 10)
                if (iSlide == this.options.slidesVisible - 1) {
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
    let newPicture = document.createElement("img")
    newPicture.src = value.results[iSlide + this.options.moviePositionAPI - removal].image_url
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
    this.gotoItem(this.moviePositionAPI + this.options.slidesToScroll)

  }

  prev () {
    this.gotoItem(this.moviePositionAPI - this.options.slidesToScroll)
  }

  /**
   * Déplace le carrousel vers l'élément ciblé
   * @param {number} index 
   */
  gotoItem (index) {
    
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
}

document.addEventListener("DOMContentLoaded", function () {
  
  new Carousel(document.querySelector("#carousel1"), {
    slidesVisible: 15,
    slidesToScroll: 2,
    pageNumberAPI: 1,
    moviePositionAPI: 0,
    infinite: true
  })
  
})




/*
function callFetch(url) {
    return fetch(url)
    .then(response => {return response.json()})
    .catch(err => console.log("Problem with fetch:" + err))
  }

function showBestMovie(url) {
  bestMovies = callFetch(url)
  bestMovies.then(value => {
    let divBestMovie = document.getElementById("bestMovie");

    let newPicture = document.createElement("img")
    newPicture.src = value.results[0].image_url
    divBestMovie.appendChild(newPicture)

    let newEltTitle = document.createElement("h3")
    let newContentTitle = document.createTextNode(value.results[0].title)
    newEltTitle.appendChild(newContentTitle)
    divBestMovie.appendChild(newEltTitle)

    let newButton = document.createElement("button")
    newButton.value = "Détails"
    divBestMovie.appendChild(newButton)

    let newEltDescription = document.createElement("p")
    bestMovie = callFetch(value.results[0].url)
    bestMovie.then(value => {
      let newContentDescription = document.createTextNode(value.description);
      newEltDescription.appendChild(newContentDescription)
      divBestMovie.appendChild(newEltDescription)
    })
  })
}

function showBestMovies(url) {
  bestMovies = callFetch(url)
  bestMovies.then(value => {
    let divBestMovies = document.getElementById("bestMovies");
    if (value.previous == null) { //1st page
      for (let iMovie = 1; iMovie < 8; iMovie++) {
        if (iMovie < 5) {
          let newPicture = document.createElement("img")
          newPicture.src = value.results[iMovie].image_url
          divBestMovies.appendChild(newPicture)
        } else {
          url = value.next
          bestMovies = callFetch(url)
          bestMovies.then(value => {
            let newPicture = document.createElement("img")
            newPicture.src = value.results[iMovie - 5].image_url
            divBestMovies.appendChild(newPicture)
        })
      }
    }
    } else {
      let lastPicture = document.querySelectorAll("#bestMovies img")[document.
        querySelectorAll("#bestMovies img").length - 1].src
      let startWriting = false
      let iMovie = 0
      while (document.querySelectorAll("#bestMovies img").length < 8 || startWriting == false)
      {
        if (startWriting == true) {
          let newPicture = document.createElement("img")
          newPicture.src = value.results[iMovie].image_url
          divBestMovies.appendChild(newPicture)
        }
        if (lastPicture == value.results[iMovie].image_url) {
          startWriting = true
          divBestMovies.innerHTML = ""
        }
        iMovie += 1
        if (iMovie > 4) {
          url = value.next
          bestMovies = callFetch(url)
          iMovie = 0
        } 
      }

    }
})
}

let url = "http://localhost:8000/api/v1/titles/?sort_by=-imdb_score,-votes"
showBestMovie(url)
showBestMovies(url)





/*
var nextBestMovies = document.getElementById("nextBestMovies")
console.log(nextBestMovies)
nextBestMovies.addEventListener("click", function() {
  console.log("toto")
})


function showNextBestMovies() {
  nextURL = callFetch(url)
  nextURL.then(value => {
    showBestMovies(value.next)
  })
}

*/
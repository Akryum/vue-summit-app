// Original source: https://github.com/rguanghui/vue-sticky/blob/master/src/index.js

function addSticky (el, binding) {
  const elStyle = el.style
  const params = binding.value || {}
  el._sticky_marginTop = params.marginTop || 0
  el._sticky_zIndex = params.zIndex || 1000

  el._sticky_originalStyle = {
    position: elStyle.position,
    top: elStyle.top,
    zIndex: elStyle.zIndex,
  }

  el.setAttribute('data-sticky', true)

  elStyle.position = '-webkit-sticky'
  elStyle.position = 'sticky'

  // if the browser support css sticky（Currently Safari, Firefox and Chrome Canary）
  if (~elStyle.position.indexOf('sticky')) {
    elStyle.top = `${el._sticky_marginTop}px`
    elStyle.zIndex = el._sticky_zIndex
    return
  }

  elStyle.position = 'relative'

  let childStyle = el.firstElementChild.style
  childStyle.cssText = `left: 0; right: 0; top: ${el._sticky_marginTop}px; z-index: ${el._sticky_zIndex}; ${childStyle.cssText}`

  let active = false

  const sticky = () => {
    if (active) {
      return
    }
    if (!elStyle.height) {
      elStyle.height = `${el.offsetHeight}px`
    }
    childStyle.willChange = 'transform'
    childStyle.position = 'fixed'
    active = true
  }

  const reset = () => {
    if (!active) {
      return
    }
    childStyle.position = 'absolute'
    active = false
  }

  const check = () => {
    const offsetTop = el.getBoundingClientRect().top
    if (offsetTop <= el._sticky_marginTop) {
      sticky()
      return
    }
    reset()
  }

  el._sticky_listenAction = () => {
    if (!window.requestAnimationFrame) {
      return setTimeout(check, 16)
    }

    window.requestAnimationFrame(check)
  }

  window.addEventListener('scroll', el._sticky_listenAction)
}

function removeSticky (el, binding) {
  if (el.getAttribute('data-sticky')) {
    el.removeAttribute('data-sticky')
    Object.assign(el.style, el._sticky_originalStyle)
    window.removeEventListener('scroll', el._sticky_listenAction)
    el._sticky_listenAction = null
  }
}

export default {
  bind (el, binding) {
    if (binding.value) addSticky(el, binding)
  },

  unbind (el, binding) {
    removeSticky(el, binding)
  },

  update (el, binding) {
    if (binding.value) {
      if (el.getAttribute('data-sticky')) {
        const params = binding.value || {}
        el._sticky_marginTop = params.marginTop || 0
        el._sticky_zIndex = params.zIndex || 1000

        let childStyle = el.firstElementChild.style
        el.style.top = childStyle.top = `${el._sticky_marginTop}px`
        el.style.zIndex = childStyle.zIndex = el._sticky_zIndex
      } else {
        addSticky(el, binding)
      }
    } else if (el.getAttribute('data-sticky')) {
      removeSticky(el, binding)
    }
  },
}

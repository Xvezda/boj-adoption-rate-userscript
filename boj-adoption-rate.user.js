// ==UserScript==
// @name         BOJ Adoption Rate Userscript
// @namespace    http://xvezda.com/
// @version      0.1
// @description  Show question author's adoption rate.
// @author       Xvezda <xvezda@naver.com>
// @match        https://www.acmicpc.net/board/view/*
// @grant        none
// ==/UserScript==

(async () => {
  // Your code here...
  const authorLink = document.querySelector('#post + * a[href^="/user/"]')
  const author = authorLink.textContent

  const response = await fetch(`/board/search`, {
    method: `POST`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: `search_scope=author&search_term=${author}&search_category=question`
  })
  const htmlText = await response.text()
  const parser = new DOMParser()
  const html = parser.parseFromString(htmlText, 'text/html')

  const tableRowXpath = '//table/tbody/tr'
  const countXpath = (context, xpath) => {
    return context
      .evaluate(`count(${xpath})`, context, null, XPathResult.ANY_TYPE, null)
      .numberValue
  }
  const allQuestionsCount = countXpath(html, `${tableRowXpath}[not(@class='success')]`)
  const answeredQuestionsCount = countXpath(html, `${tableRowXpath}[not(@class='success')]/td[4]/text()[.>0]`)
  const adoptedQuestionsCount = countXpath(html, `${tableRowXpath}//*[text()[.='해결']]`)

  const roundByNth = (value, n) => {
    return Math.round(value * (10**n)) / (10**n)
  }

  /*
  let statistics = `최근 답변된 질문: ${answeredQuestionsCount}개, 답변 채택된 질문: ${adoptedQuestionsCount}개`
  console.log(statistics)
  */

  const buildAlert = () => {
    const adoptionRate = (() => {
      if (!allQuestionsCount || !answeredQuestionsCount) return 'N/A'
      if (!adoptedQuestionsCount) return '0.00'
      return roundByNth(adoptedQuestionsCount / answeredQuestionsCount * 100, 2)
    })()
    const alertBox = document.createElement('div')
    alertBox.style.fontSize = '15px'
    alertBox.setAttribute('class', 'alert alert-info')

    const bold = document.createElement('strong')
    bold.textContent = `답변 채택률: ${adoptionRate}%`
    alertBox.appendChild(bold)

    const span = document.createElement('span')
    span.textContent = ` | 최근 답변된 질문: ${answeredQuestionsCount}개`
    span.textContent += ` | 최근 해결된 질문: ${adoptedQuestionsCount}개`
    alertBox.appendChild(span)

    return alertBox
  }
  document.querySelector('.page-header').appendChild(buildAlert())
})()

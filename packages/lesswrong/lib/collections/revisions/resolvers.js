import Revisions from './collection'
import { htmlToDraft } from '../../editor/utils';
import { convertToRaw } from 'draft-js';
import { markdownToHtml, dataToMarkdown } from '../../../server/editor/make_editable_callbacks'
import { highlightFromHTML } from '../../editor/ellipsize';
import { JSDOM } from 'jsdom'
import htmlToText from 'html-to-text'

const PLAINTEXT_DESCRIPTION_LENGTH = 500



function domBuilder(html) {
  const jsdom = new JSDOM(html)
  const document = jsdom.window.document;
  const bodyEl = document.body; // implicitly created
  return bodyEl
}


function htmlToDraftServer(...args) {
  // We have to add this type definition to the global object to allow draft-convert to properly work on the server
  global.HTMLElement = new JSDOM().window.HTMLElement
  // And alas, it looks like we have to add this global. This seems quite bad, and I am not fully sure what to do about it.
  global.document = new JSDOM().window.document
  const result = htmlToDraft(...args) 
  // We do however at least remove it right afterwards
  delete global.document
  delete global.HTMLElement
  return result
}

export function dataToDraftJS(data, type) {
  switch (type) {
    case "draftJS": {
      return data
    }
    case "html": {
      const draftJSContentState = htmlToDraftServer(data, {}, domBuilder)
      return convertToRaw(draftJSContentState)  // On the server have to parse in a JS-DOM implementation to make htmlToDraft work
    }
    case "markdown": {
      const html = markdownToHtml(data)
      const draftJSContentState = htmlToDraftServer(html, {}, domBuilder) // On the server have to parse in a JS-DOM implementation to make htmlToDraft work
      return convertToRaw(draftJSContentState) 
    }
  }
}

Revisions.addField([
  {
    fieldName: 'markdown',
    fieldSchema: {
      type: String,
      resolveAs: {
        type: 'String',
        resolver: ({originalContents: {data, type}}) => dataToMarkdown(data, type)
      }
    }
  },
  {
    fieldName: 'draftJS',
    fieldSchema: {
      type: Object,
      resolveAs: {
        type: 'JSON',
        resolver: ({originalContents: {data, type}}) => dataToDraftJS(data, type)
      }
    }
  },
  {
    fieldName: 'htmlHighlight',
    fieldSchema: {
      type: String,
      resolveAs: {
        type: 'String',
        resolver: ({html}) => highlightFromHTML(html)
      }
    }
  },
  {
    fieldName: 'plaintextDescription',
    fieldSchema: {
      type: String,
      resolveAs: {
        type: 'String',
        resolver: ({html}) => htmlToText
                              .fromString(html)
                              .substring(0, PLAINTEXT_DESCRIPTION_LENGTH)
      }
    }
  }
])
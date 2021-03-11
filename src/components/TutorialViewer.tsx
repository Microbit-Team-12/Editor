import React from 'react';
import ReactMarkdown from 'react-markdown';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {dark} from 'react-syntax-highlighter/dist/esm/styles/prism';

type TutorialViewerProps = {
  className?: string,
  markdown: string,
}

type CodeBlock = {
  /// e.g. ```py```
  language: string,
  /// content of the code block
  value: string,
}


export default class TutorialViewer extends React.Component<TutorialViewerProps, unknown> {
  // constructor(props: TutorialViewerProps) {
  //   super(props);
  // }

  renderCodeBlock(codeBlock: CodeBlock): JSX.Element {
    return (
      <SyntaxHighlighter style={dark} language={codeBlock.language}>
        {codeBlock.value}
      </SyntaxHighlighter>
    );
  }

  renderers = {
    code: this.renderCodeBlock.bind(this),
  }


  render(): JSX.Element {
    return (
      <ReactMarkdown
        className={this.props.className}
        renderers={this.renderers}
      >
        {this.props.markdown}
      </ReactMarkdown>
    );
  }
}

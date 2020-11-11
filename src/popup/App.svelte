<script lang="typescript">
  import { Button, Container, Row, Col } from "svelte-chota";

  function onReport(template: "Bug" | "Feature") {
    window.open(
      `https://gitlab.com/davidfou/conventionalcomments-web-extension/-/issues/new?issuable_template=${template}`,
      "_blank"
    );
    window.close();
  }
</script>

<style>
  h1 {
    margin-bottom: 0;
  }
  h1 > strong {
    color: #6b46c1;
  }
</style>

<Container>
  <Row>
    <Col size="12">
      <h1 class="text-center"><strong>conventional:</strong> comments</h1>
      <p class="text-center">
        Comments that are easy to
        <a
          href="https://en.wikipedia.org/wiki/Grok#In_computer_programmer_culture">grok</a>
        and
        <a href="https://en.wikipedia.org/wiki/Grep">grep</a>
      </p>
    </Col>
  </Row>
  <Row>
    <p>
      Preformat comments on Gitlab by respecting
      <a href="https://conventionalcomments.org/">conventional: comments</a>.
      This extension is under development. Feedback is welcome and would help
      its development.
    </p>
    <Button error on:click={() => onReport('Bug')}>Bug Report</Button>
    <Button success on:click={() => onReport('Feature')}>
      Feature Request
    </Button>
  </Row>
</Container>

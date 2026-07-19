import assert from "node:assert/strict";
import test from "node:test";

import {
  refreshAudienceUrl,
  rootAudienceUrl,
  shareableAudienceUrl,
} from "../review/audience-location.mjs";

const baseUrl = "http://127.0.0.1:4567/renderer/architecture/";

test("intentional source-set switches reset the audience to its root", () => {
  const previous = `${baseUrl}?arch=genie3&board=latent_transformer&node=pair_transition`;
  const next = rootAudienceUrl(previous, "dit");

  assert.equal(next, `${baseUrl}?arch=dit`);
});

test("apply refresh preserves board, node, and renderer layout", () => {
  const current = `${baseUrl}?arch=genie3&board=latent_transformer&node=pair_transition&layout=elk&review_refresh=old`;
  const refreshed = new URL(refreshAudienceUrl(current, {
    baseUrl,
    sourceSet: "genie3",
    refreshToken: 1234,
  }));

  assert.equal(refreshed.searchParams.get("arch"), "genie3");
  assert.equal(refreshed.searchParams.get("board"), "latent_transformer");
  assert.equal(refreshed.searchParams.get("node"), "pair_transition");
  assert.equal(refreshed.searchParams.get("layout"), "elk");
  assert.equal(refreshed.searchParams.get("review_refresh"), "1234");
});

test("the external audience link mirrors deep state without review-only parameters", () => {
  const current = `${baseUrl}?arch=genie3&board=denoiser_forward&node=structure_decoder&review_refresh=99&edit=1`;
  const shared = new URL(shareableAudienceUrl(current, { baseUrl, sourceSet: "genie3" }));

  assert.equal(shared.searchParams.get("board"), "denoiser_forward");
  assert.equal(shared.searchParams.get("node"), "structure_decoder");
  assert.equal(shared.searchParams.has("review_refresh"), false);
  assert.equal(shared.searchParams.has("edit"), false);
});

test("the external link follows an iframe architecture navigation exactly", () => {
  const current = `${baseUrl}?arch=dit&board=dit_backbone`;
  const shared = new URL(shareableAudienceUrl(current, { baseUrl, sourceSet: "genie3" }));

  assert.equal(shared.searchParams.get("arch"), "dit");
  assert.equal(shared.searchParams.get("board"), "dit_backbone");
});

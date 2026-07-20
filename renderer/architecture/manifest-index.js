export const manifestIndex = [
  {
    "id": "generic",
    "name": "Generic Feature Refinement",
    "role": "reference",
    "file": "manifest-generic.js"
  },
  {
    "id": "dit",
    "name": "Diffusion Transformer (DiT)",
    "role": "architecture",
    "file": "manifest-dit.js"
  },
  {
    "id": "af2",
    "name": "AlphaFold 2 Monomer",
    "role": "architecture",
    "file": "manifest-af2.js"
  },
  {
    "id": "genie2",
    "name": "Genie 2 Protein Backbone Diffusion",
    "role": "architecture",
    "file": "manifest-genie2.js"
  },
  {
    "id": "genie3",
    "name": "Genie 3 Atom-Aware Protein Diffusion",
    "role": "architecture",
    "file": "manifest-genie3.js"
  }
];
export const comparisonIndex = {
  "schemaVersion": "comparison-registry-v0.1",
  "compilerVersion": "architecture-comparison-compiler-v0.1",
  "sourceYaml": "../../comparisons/index.yaml",
  "build": {
    "generator": "architecture-manifest-builder-v0.5.0",
    "inputDigests": {
      "comparisons/index.yaml": "54059100527b7b47f0096e90227ce5668a3d2693e0b48c8af971a200feed97e4",
      "comparisons/genie3-reduced-vs-full-ipa.yaml": "85eed3b6f228c693e494bd93a606829f383b1c41e4a05425eafd911f5d7c5d1b",
      "references/bibliography.yaml": "abe9226586bfb64261c81b7756b7275c48a3a172a9a18b5f91f7acfd3145e374",
      "architectures/generic-feature-refinement.yaml": "856e34131dc78dd2454df9b0dc3ad3d0adff67c5a7f9dee5809cacf311722d68",
      "views/generic-semantic-zoom.view.yaml": "2212d81c8217db03c68fa7d59f44dc36e55052503d8d503b3386bded040b5714",
      "standard_blocks/pair-biased-attention.yaml": "9cd25cca99e46326432232d92a00d84d82b3e59d028aff4e47d73aa31bac9381",
      "standard_blocks/per-item-adaln-conditioning.yaml": "544bca1c4d238825bfe6e389fe0409e64b27726b54f737e86021a0dc078987f9",
      "standard_blocks/additive-conditioning.yaml": "5638ead7cbb2df6729e58393703d3e35b6e480b3ba42c657312dc6581bb032f7",
      "architectures/diffusion-transformer.yaml": "62b1a3f47c1b0891d242c49ca269a5f1e856672fbd080a07e7eebf718a8a8965",
      "views/dit-semantic-zoom.view.yaml": "ebca6fefd29f612792b8957db940cc3237132140722d52b76999194823dbc5eb",
      "standard_blocks/adaln-zero-conditioning.yaml": "33cd9afbe3b6867c4ce328c25d41a33210a5e387a195a93b19bc8696ee9e0b32",
      "standard_blocks/sinusoidal-timestep-embedding.yaml": "8cb2d467fe967e9a83da657ef85940406be89836de502d24cb7f557152763039",
      "architectures/alphafold2.yaml": "a754a17dc83303c7dff50f6925771b01dc51d237dae382476b8bf87fbead77fe",
      "views/alphafold2-semantic-zoom.view.yaml": "6b317c6d224a7e3b8416839247c0c12d6b9e0cd34d859475f4529a939d51fe8e",
      "architectures/genie2.yaml": "dc70626daca21c212b372e601a3a064ee1a1ea01e226b955b21e00e4c308bdb0",
      "views/genie2-semantic-zoom.view.yaml": "e5ed5c07d6c8bc3215aa09b1e2ca261c2861a1dc19bdf8c3968d69c23e28b0d2",
      "standard_blocks/invariant-point-attention.yaml": "a5c02021172a36135808767943f20309424cc956240bf956ed156d1c380bb7b5",
      "architectures/genie3.yaml": "313447c6bd218b67ba3a5cdda312b9b229a56068d59033333ac5cbac757e051c",
      "views/genie3-semantic-zoom.view.yaml": "df225112f3b15c3d3049eeb8e14d8cf1b162a22bd2af9ccac3418dd4f33cf06c"
    }
  },
  "items": [
    {
      "schemaVersion": "architecture-comparison-v0.1",
      "compilerVersion": "architecture-comparison-compiler-v0.1",
      "id": "genie3_reduced_vs_full_ipa",
      "title": "Genie 3 Reduced Attention vs Full Frame-Aware IPA",
      "status": "review",
      "question": "What does Genie 3's reduced latent attention retain, change, and remove relative to full frame-aware IPA?",
      "summary": "Both attention cores use scalar attention, pair-logit bias, and attention-weighted pair-value aggregation. Full IPA additionally forms frame-aware point logits and point outputs; the reduced latent block omits that geometry and owns a residual-normalized transition wrapper that sits outside full IPA in the structure decoder.",
      "subjects": {
        "primary": {
          "label": "Reduced latent attention",
          "sourceSet": "genie3",
          "subjectRef": "block_instances.latent_reduced_pair_attention",
          "boardRef": "genie3_reduced_pair_attention_internals",
          "boardTitle": "Genie 3 Reduced Pair Attention Internals",
          "kind": "block_instance",
          "standardBlockId": "pair_biased_attention",
          "standardBlockRef": "standard_blocks/pair-biased-attention.yaml",
          "variant": "pair_values_residual_norm_transition",
          "variantLabel": "Reduced pair attention + wrapper",
          "conformance": "reduced",
          "differenceSummary": "Genie 3 removes frame-aware point terms, keeps pair-logit bias and attention-weighted pair-value aggregation, then adds residual normalization, a single transition, and final masking."
        },
        "counterpart": {
          "label": "Full frame-aware IPA",
          "sourceSet": "genie3",
          "subjectRef": "block_instances.structure_ipa",
          "boardRef": "genie3_ipa_internals",
          "boardTitle": "Genie 3 Invariant Point Attention Internals",
          "kind": "block_instance",
          "standardBlockId": "invariant_point_attention",
          "standardBlockRef": "standard_blocks/invariant-point-attention.yaml",
          "variant": "full_ipa",
          "variantLabel": "Full frame-aware IPA",
          "conformance": "exact"
        }
      },
      "groups": [
        {
          "id": "shared",
          "label": "Shared attention path",
          "description": "Scalar attention and pair-conditioned operations that play the same algorithmic role in both implementations.",
          "alignmentRefs": [
            "alignments.scalar_projection",
            "alignments.scalar_logits",
            "alignments.pair_bias",
            "alignments.logit_mask_and_softmax",
            "alignments.scalar_value_aggregation",
            "alignments.pair_value_aggregation",
            "alignments.output_fusion"
          ]
        },
        {
          "id": "full_only",
          "label": "Full IPA only",
          "description": "Frame-aware point operations present only in the full structure-decoder IPA path.",
          "alignmentRefs": [
            "alignments.frame_aware_point_path"
          ]
        },
        {
          "id": "reduced_only",
          "label": "Reduced instance wrapper only",
          "description": "Wrapper behavior owned by the reduced latent block but kept outside the full IPA module boundary.",
          "alignmentRefs": [
            "alignments.residual_normalization",
            "alignments.latent_transition_and_output_mask"
          ]
        }
      ],
      "alignments": [
        {
          "id": "scalar_projection",
          "groupRef": "groups.shared",
          "label": "Scalar query, key, and value projection",
          "relationship": "analogous",
          "explanation": "Both steps derive scalar queries, keys, and values from the incoming single state, although the concrete projection modules and dimensions belong to their respective implementations.",
          "primaryFacts": [
            {
              "factRef": "block_instances.latent_reduced_pair_attention.steps.project_qkv",
              "kind": "step",
              "label": "Project Q, K, and V",
              "nodeIds": [
                "project_qkv"
              ],
              "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_qkv",
              "blockInstanceRef": "block_instances.latent_reduced_pair_attention"
            }
          ],
          "counterpartFacts": [
            {
              "factRef": "block_instances.structure_ipa.steps.project_scalar_terms",
              "kind": "step",
              "label": "Project scalar Q/K/V",
              "nodeIds": [
                "project_scalar_terms"
              ],
              "templateFactRef": "standard_blocks.invariant_point_attention.steps.project_scalar_terms",
              "blockInstanceRef": "block_instances.structure_ipa"
            }
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_ipa_code",
                "role": "primary_implementation_evidence",
                "locator": "ReducedInvariantPointAttention.forward"
              },
              {
                "source_ref": "genie3_ipa_code",
                "role": "counterpart_implementation_evidence",
                "locator": "InvariantPointAttention.forward"
              }
            ]
          }
        },
        {
          "id": "scalar_logits",
          "groupRef": "groups.shared",
          "label": "Scalar attention logits",
          "relationship": "analogous",
          "explanation": "Both implementations form query-key scalar logits before adding non-scalar attention terms.",
          "primaryFacts": [
            {
              "factRef": "block_instances.latent_reduced_pair_attention.steps.scalar_logits",
              "kind": "step",
              "label": "Form query-key logits",
              "nodeIds": [
                "scalar_logits_step"
              ],
              "templateFactRef": "standard_blocks.pair_biased_attention.steps.scalar_logits",
              "blockInstanceRef": "block_instances.latent_reduced_pair_attention"
            }
          ],
          "counterpartFacts": [
            {
              "factRef": "block_instances.structure_ipa.steps.scalar_attention_logits",
              "kind": "step",
              "label": "Form scalar logits",
              "nodeIds": [
                "scalar_attention_logits"
              ],
              "templateFactRef": "standard_blocks.invariant_point_attention.steps.scalar_attention_logits",
              "blockInstanceRef": "block_instances.structure_ipa"
            }
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_ipa_code",
                "role": "primary_implementation_evidence",
                "locator": "ReducedInvariantPointAttention.forward"
              },
              {
                "source_ref": "genie3_ipa_code",
                "role": "counterpart_implementation_evidence",
                "locator": "InvariantPointAttention.forward"
              }
            ]
          }
        },
        {
          "id": "pair_bias",
          "groupRef": "groups.shared",
          "label": "Pair representation biases attention",
          "relationship": "equivalent",
          "explanation": "Both implementations project the pair representation into a per-head additive attention-logit bias.",
          "primaryFacts": [
            {
              "factRef": "block_instances.latent_reduced_pair_attention.steps.project_pair_bias",
              "kind": "step",
              "label": "Project pair bias",
              "nodeIds": [
                "project_pair_bias"
              ],
              "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_pair_bias",
              "blockInstanceRef": "block_instances.latent_reduced_pair_attention"
            }
          ],
          "counterpartFacts": [
            {
              "factRef": "block_instances.structure_ipa.steps.project_pair_bias",
              "kind": "step",
              "label": "Project pair bias",
              "nodeIds": [
                "project_pair_bias"
              ],
              "templateFactRef": "standard_blocks.invariant_point_attention.steps.project_pair_bias",
              "blockInstanceRef": "block_instances.structure_ipa"
            }
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_ipa_code",
                "role": "primary_implementation_evidence",
                "locator": "ReducedInvariantPointAttention.forward"
              },
              {
                "source_ref": "genie3_ipa_code",
                "role": "counterpart_implementation_evidence",
                "locator": "InvariantPointAttention.forward"
              }
            ]
          }
        },
        {
          "id": "logit_mask_and_softmax",
          "groupRef": "groups.shared",
          "label": "Compose, mask, and normalize logits",
          "relationship": "changed",
          "explanation": "Both paths add pair bias, apply the validity mask, and normalize over keys, but full IPA also adds its point-distance term during logit composition.",
          "primaryFacts": [
            {
              "factRef": "block_instances.latent_reduced_pair_attention.steps.combine_logits",
              "kind": "step",
              "label": "Add pair bias",
              "nodeIds": [
                "combine_logits"
              ],
              "templateFactRef": "standard_blocks.pair_biased_attention.steps.combine_logits",
              "blockInstanceRef": "block_instances.latent_reduced_pair_attention"
            },
            {
              "factRef": "block_instances.latent_reduced_pair_attention.steps.apply_attention_mask",
              "kind": "step",
              "label": "Apply attention mask",
              "nodeIds": [
                "apply_attention_mask"
              ],
              "templateFactRef": "standard_blocks.pair_biased_attention.steps.apply_attention_mask",
              "blockInstanceRef": "block_instances.latent_reduced_pair_attention"
            },
            {
              "factRef": "block_instances.latent_reduced_pair_attention.steps.softmax_attention_masked",
              "kind": "step",
              "label": "Normalize masked attention",
              "nodeIds": [
                "softmax_attention_masked"
              ],
              "templateFactRef": "standard_blocks.pair_biased_attention.steps.softmax_attention_masked",
              "blockInstanceRef": "block_instances.latent_reduced_pair_attention"
            }
          ],
          "counterpartFacts": [
            {
              "factRef": "block_instances.structure_ipa.steps.combine_and_mask_logits",
              "kind": "step",
              "label": "Combine logits and apply mask",
              "nodeIds": [
                "combine_and_mask_logits"
              ],
              "templateFactRef": "standard_blocks.invariant_point_attention.steps.combine_and_mask_logits",
              "blockInstanceRef": "block_instances.structure_ipa"
            },
            {
              "factRef": "block_instances.structure_ipa.steps.softmax_attention",
              "kind": "step",
              "label": "Normalize over keys",
              "nodeIds": [
                "softmax_attention"
              ],
              "templateFactRef": "standard_blocks.invariant_point_attention.steps.softmax_attention",
              "blockInstanceRef": "block_instances.structure_ipa"
            }
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_ipa_code",
                "role": "primary_implementation_evidence",
                "locator": "ReducedInvariantPointAttention.forward"
              },
              {
                "source_ref": "genie3_ipa_code",
                "role": "counterpart_implementation_evidence",
                "locator": "InvariantPointAttention.forward"
              }
            ]
          }
        },
        {
          "id": "scalar_value_aggregation",
          "groupRef": "groups.shared",
          "label": "Aggregate scalar values",
          "relationship": "analogous",
          "explanation": "Both paths use the normalized attention weights to aggregate scalar values into a per-token context.",
          "primaryFacts": [
            {
              "factRef": "block_instances.latent_reduced_pair_attention.steps.aggregate_scalar_values",
              "kind": "step",
              "label": "Aggregate scalar values",
              "nodeIds": [
                "aggregate_scalar_values"
              ],
              "templateFactRef": "standard_blocks.pair_biased_attention.steps.aggregate_scalar_values",
              "blockInstanceRef": "block_instances.latent_reduced_pair_attention"
            }
          ],
          "counterpartFacts": [
            {
              "factRef": "block_instances.structure_ipa.steps.aggregate_scalar_values",
              "kind": "step",
              "label": "Aggregate scalar values",
              "nodeIds": [
                "aggregate_scalar_values"
              ],
              "templateFactRef": "standard_blocks.invariant_point_attention.steps.aggregate_scalar_values",
              "blockInstanceRef": "block_instances.structure_ipa"
            }
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_ipa_code",
                "role": "primary_implementation_evidence",
                "locator": "ReducedInvariantPointAttention.forward"
              },
              {
                "source_ref": "genie3_ipa_code",
                "role": "counterpart_implementation_evidence",
                "locator": "InvariantPointAttention.forward"
              }
            ]
          }
        },
        {
          "id": "pair_value_aggregation",
          "groupRef": "groups.shared",
          "label": "Attention-weighted pair-value aggregation",
          "relationship": "equivalent",
          "explanation": "Both paths use the same attention weights to aggregate the pair representation as an output value stream, not only as a logit bias.",
          "primaryFacts": [
            {
              "factRef": "block_instances.latent_reduced_pair_attention.steps.aggregate_pair_values",
              "kind": "step",
              "label": "Attention-weighted pair-value aggregation",
              "nodeIds": [
                "aggregate_pair_values"
              ],
              "templateFactRef": "standard_blocks.pair_biased_attention.steps.aggregate_pair_values",
              "blockInstanceRef": "block_instances.latent_reduced_pair_attention"
            }
          ],
          "counterpartFacts": [
            {
              "factRef": "block_instances.structure_ipa.steps.aggregate_pair_values",
              "kind": "step",
              "label": "Attention-weighted pair-value aggregation",
              "nodeIds": [
                "aggregate_pair_values"
              ],
              "templateFactRef": "standard_blocks.invariant_point_attention.steps.aggregate_pair_values",
              "blockInstanceRef": "block_instances.structure_ipa"
            }
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_ipa_code",
                "role": "primary_implementation_evidence",
                "locator": "ReducedInvariantPointAttention.forward"
              },
              {
                "source_ref": "genie3_ipa_code",
                "role": "counterpart_implementation_evidence",
                "locator": "InvariantPointAttention.forward"
              }
            ]
          }
        },
        {
          "id": "output_fusion",
          "groupRef": "groups.shared",
          "label": "Fuse attention outputs",
          "relationship": "changed",
          "explanation": "Reduced attention fuses scalar and pair contexts, whereas full IPA also fuses the frame-aware local point context.",
          "primaryFacts": [
            {
              "factRef": "block_instances.latent_reduced_pair_attention.steps.project_reduced_output",
              "kind": "step",
              "label": "Fuse scalar and pair contexts",
              "nodeIds": [
                "project_reduced_output"
              ],
              "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_reduced_output",
              "blockInstanceRef": "block_instances.latent_reduced_pair_attention"
            }
          ],
          "counterpartFacts": [
            {
              "factRef": "block_instances.structure_ipa.steps.project_ipa_delta",
              "kind": "step",
              "label": "Concatenate + project",
              "nodeIds": [
                "project_ipa_delta"
              ],
              "templateFactRef": "standard_blocks.invariant_point_attention.steps.project_ipa_delta",
              "blockInstanceRef": "block_instances.structure_ipa"
            }
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_ipa_code",
                "role": "primary_implementation_evidence",
                "locator": "ReducedInvariantPointAttention.forward"
              },
              {
                "source_ref": "genie3_ipa_code",
                "role": "counterpart_implementation_evidence",
                "locator": "InvariantPointAttention.forward"
              }
            ]
          }
        },
        {
          "id": "residual_normalization",
          "groupRef": "groups.reduced_only",
          "label": "Residual, dropout, and normalization",
          "relationship": "primary_only",
          "explanation": "The reduced block instance owns its residual wrapper. Genie 3's structure decoder performs the analogous operation in StructureLayer after the full IPA module returns, so it is intentionally outside the full IPA standard-block instance.",
          "primaryFacts": [
            {
              "factRef": "block_instances.latent_reduced_pair_attention.steps.residual_norm",
              "kind": "step",
              "label": "Residual, dropout, and norm",
              "nodeIds": [
                "residual_norm"
              ],
              "templateFactRef": "standard_blocks.pair_biased_attention.steps.residual_norm",
              "blockInstanceRef": "block_instances.latent_reduced_pair_attention"
            }
          ],
          "counterpartFacts": [

          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_latent_transformer_code",
                "role": "primary_wrapper_evidence",
                "locator": "LatentTransformerBlock.forward"
              },
              {
                "source_ref": "genie3_structure_code",
                "role": "counterpart_wrapper_evidence",
                "locator": "StructureLayer.forward"
              }
            ]
          }
        },
        {
          "id": "frame_aware_point_path",
          "groupRef": "groups.full_only",
          "label": "Frame-aware point attention",
          "relationship": "counterpart_only",
          "explanation": "Only full IPA projects points, expresses them through token frames, uses invariant point distances in the logits, and returns aggregated point values to the query frame.",
          "primaryFacts": [

          ],
          "counterpartFacts": [
            {
              "factRef": "block_instances.structure_ipa.steps.project_local_points",
              "kind": "step",
              "label": "Project local Q/K/V points",
              "nodeIds": [
                "project_local_points"
              ],
              "templateFactRef": "standard_blocks.invariant_point_attention.steps.project_local_points",
              "blockInstanceRef": "block_instances.structure_ipa"
            },
            {
              "factRef": "block_instances.structure_ipa.steps.transform_points_to_global",
              "kind": "step",
              "label": "Express points in global frame",
              "nodeIds": [
                "transform_points_to_global"
              ],
              "templateFactRef": "standard_blocks.invariant_point_attention.steps.transform_points_to_global",
              "blockInstanceRef": "block_instances.structure_ipa"
            },
            {
              "factRef": "block_instances.structure_ipa.steps.point_distance_logits",
              "kind": "step",
              "label": "Form point-distance logits",
              "nodeIds": [
                "point_distance_logits"
              ],
              "templateFactRef": "standard_blocks.invariant_point_attention.steps.point_distance_logits",
              "blockInstanceRef": "block_instances.structure_ipa"
            },
            {
              "factRef": "block_instances.structure_ipa.steps.aggregate_global_points",
              "kind": "step",
              "label": "Aggregate value points",
              "nodeIds": [
                "aggregate_global_points"
              ],
              "templateFactRef": "standard_blocks.invariant_point_attention.steps.aggregate_global_points",
              "blockInstanceRef": "block_instances.structure_ipa"
            },
            {
              "factRef": "block_instances.structure_ipa.steps.return_points_to_local_frame",
              "kind": "step",
              "label": "Return points to query frame",
              "nodeIds": [
                "return_points_to_local_frame"
              ],
              "templateFactRef": "standard_blocks.invariant_point_attention.steps.return_points_to_local_frame",
              "blockInstanceRef": "block_instances.structure_ipa"
            }
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_ipa_code",
                "role": "primary_implementation_evidence",
                "locator": "ReducedInvariantPointAttention.forward"
              },
              {
                "source_ref": "genie3_ipa_code",
                "role": "counterpart_implementation_evidence",
                "locator": "InvariantPointAttention.forward"
              }
            ]
          }
        },
        {
          "id": "latent_transition_and_output_mask",
          "groupRef": "groups.reduced_only",
          "label": "Latent transition and final output mask",
          "relationship": "primary_only",
          "explanation": "The reduced latent block follows residual normalization with its transition MLP and reapplies the token mask; that wrapper step is not part of the selected full IPA variant.",
          "primaryFacts": [
            {
              "factRef": "block_instances.latent_reduced_pair_attention.steps.transition_and_mask",
              "kind": "step",
              "label": "Transition and mask",
              "nodeIds": [
                "transition_and_mask"
              ],
              "templateFactRef": "standard_blocks.pair_biased_attention.steps.transition_and_mask",
              "blockInstanceRef": "block_instances.latent_reduced_pair_attention"
            }
          ],
          "counterpartFacts": [

          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_latent_transformer_code",
                "role": "primary_wrapper_evidence",
                "locator": "LatentTransformerBlock.forward"
              },
              {
                "source_ref": "genie3_structure_code",
                "role": "counterpart_wrapper_evidence",
                "locator": "StructureLayer.forward"
              }
            ]
          }
        }
      ],
      "findings": [
        {
          "id": "pair_path_is_retained",
          "statement": "Reduced attention retains both pair-logit bias and attention-weighted pair-value aggregation.",
          "alignmentRefs": [
            "alignments.pair_bias",
            "alignments.pair_value_aggregation"
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_ipa_code",
                "role": "primary_implementation_evidence",
                "locator": "ReducedInvariantPointAttention.forward"
              },
              {
                "source_ref": "genie3_ipa_code",
                "role": "counterpart_implementation_evidence",
                "locator": "InvariantPointAttention.forward"
              }
            ]
          }
        },
        {
          "id": "geometry_is_removed",
          "statement": "The reduction removes the complete frame-aware point path rather than merely simplifying its visualization.",
          "alignmentRefs": [
            "alignments.frame_aware_point_path",
            "alignments.output_fusion"
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_ipa_code",
                "role": "primary_implementation_evidence",
                "locator": "ReducedInvariantPointAttention.forward"
              },
              {
                "source_ref": "genie3_ipa_code",
                "role": "counterpart_implementation_evidence",
                "locator": "InvariantPointAttention.forward"
              }
            ]
          }
        },
        {
          "id": "wrapper_scope_differs",
          "statement": "The reduced latent block owns residual normalization and its transition-and-mask wrapper, whereas the structure decoder keeps its residual and transition operations outside the full IPA module boundary.",
          "alignmentRefs": [
            "alignments.residual_normalization",
            "alignments.latent_transition_and_output_mask"
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "genie3_latent_transformer_code",
                "role": "primary_wrapper_evidence",
                "locator": "LatentTransformerBlock.forward"
              },
              {
                "source_ref": "genie3_structure_code",
                "role": "counterpart_wrapper_evidence",
                "locator": "StructureLayer.forward"
              }
            ]
          }
        }
      ],
      "openQuestions": [

      ],
      "sourceYaml": "../../comparisons/genie3-reduced-vs-full-ipa.yaml"
    }
  ]
};

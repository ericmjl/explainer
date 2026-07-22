export const manifest = {
  "schemaVersion": "architecture-manifest-v0.5",
  "build": {
    "generator": "architecture-manifest-builder-v0.5.0",
    "inputDigests": {
      "references/bibliography.yaml": "82f709e900c8a4856e4b834e7d3d7269313b9e4aa08f6bea91d75c33ef974bdd",
      "architectures/alphafold3-pairformer.yaml": "0e9baf415f97e87da42420e5fde1916ff0563839695638aea1c159c09d20419d",
      "views/alphafold3-pairformer-semantic-zoom.view.yaml": "3978a4c18d06c27104497dce4c349e90e65ea95f684ddf878f22c323badc440b",
      "pseudocode/alphafold3-pairformer.yaml": "babbe2e580f0f283bc953051127f5cba2fe2905f215334f3850e3794b229de27"
    }
  },
  "architecture": {
    "schemaVersion": "architecture-v0.5",
    "id": "alphafold3_pairformer",
    "name": "AlphaFold 3 Pairformer",
    "family": "transformer",
    "status": "review",
    "taskModes": [
      "prediction"
    ],
    "referenceConfiguration": null,
    "sourceYaml": "../../architectures/alphafold3-pairformer.yaml",
    "sources": [
      {
        "source_ref": "af3_2024",
        "role": "architecture_source",
        "locator": "Fig. 2a and Supplementary Methods 3.6"
      },
      {
        "source_ref": "af3_pairformer_code",
        "role": "implementation_source",
        "locator": "PairFormerIteration, GridSelfAttention, TriangleMultiplication, and TransitionBlock"
      },
      {
        "source_ref": "af3_evoformer_code",
        "role": "configuration_source",
        "locator": "Evoformer.Config and Evoformer.__call__"
      },
      {
        "source_ref": "af3_self_attention_code",
        "role": "implementation_source",
        "locator": "SelfAttentionConfig and self_attention"
      }
    ],
    "decomposition": {
      "status": "complete",
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "af3_pairformer_code",
            "role": "implementation_evidence",
            "locator": "PairFormerIteration.__call__",
            "note": "The source set deliberately stops at the already-embedded single and pair representations."
          }
        ]
      }
    },
    "coverage": {
      "method": "declared_decomposition_closure",
      "scopes": {
        "architecture": {
          "status": "complete",
          "depth": 0,
          "immediateModuleCount": 1,
          "immediateModuleRefs": [
            "modules.pairformer_stack"
          ]
        },
        "modules.pairformer_stack": {
          "status": "complete",
          "depth": 1,
          "immediateModuleCount": 2,
          "immediateModuleRefs": [
            "modules.pair_update_stage",
            "modules.single_update_stage"
          ]
        },
        "modules.pair_update_stage": {
          "status": "complete",
          "depth": 2,
          "immediateModuleCount": 5,
          "immediateModuleRefs": [
            "modules.triangle_multiplication_outgoing",
            "modules.triangle_multiplication_incoming",
            "modules.pair_attention_starting_node",
            "modules.pair_attention_ending_node",
            "modules.pair_transition"
          ]
        },
        "modules.triangle_multiplication_outgoing": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.triangle_multiplication_incoming": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_attention_starting_node": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_attention_ending_node": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.pair_transition": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.single_update_stage": {
          "status": "complete",
          "depth": 2,
          "immediateModuleCount": 3,
          "immediateModuleRefs": [
            "modules.single_pair_logits_projection",
            "modules.single_attention_with_pair_bias",
            "modules.single_transition"
          ]
        },
        "modules.single_pair_logits_projection": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.single_attention_with_pair_bias": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.single_transition": {
          "status": "leaf",
          "depth": 3,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        }
      },
      "summary": {
        "scopeCount": 12,
        "expandedScopeCount": 4,
        "completeExpandedScopeCount": 4,
        "partialScopeCount": 0,
        "leafFrontierCount": 8,
        "opaqueFrontierCount": 0,
        "partialFrontierCount": 0,
        "maximumAuthoredDepth": 3
      },
      "opaqueFrontierRefs": [

      ],
      "partialScopeRefs": [

      ]
    },
    "modules": [
      {
        "id": "pairformer_stack",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "complete"
        },
        "label": "Pairformer Stack",
        "kind": "refiner",
        "mechanisms": [
          "pair_reasoning",
          "pair_biased_single_attention"
        ],
        "role": "refine pair and single token representations through 48 independently parameterized blocks",
        "scale": "token_and_token_pair",
        "repeats": 48,
        "depth": {
          "blocks": 48
        },
        "pseudocode_ref": "../../pseudocode/alphafold3-pairformer.yaml",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack construction and application"
            }
          ]
        }
      },
      {
        "id": "pair_update_stage",
        "parent_ref": "modules.pairformer_stack",
        "decomposition": {
          "status": "complete"
        },
        "label": "Pair Track Update",
        "kind": "refiner",
        "mechanisms": [
          "triangle_multiplication",
          "axial_pair_attention",
          "transition"
        ],
        "role": "apply five ordered residual updates to the pair representation",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "triangle_multiplication_outgoing",
        "parent_ref": "modules.pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Triangle Multiplication Outgoing",
        "kind": "operator",
        "mechanisms": [
          "triangle_multiplication",
          "gated_projection",
          "residual_update"
        ],
        "role": "aggregate products over shared outgoing edges and add the result to pair state",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "TriangleMultiplication.__call__ and PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "triangle_multiplication_incoming",
        "parent_ref": "modules.pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Triangle Multiplication Incoming",
        "kind": "operator",
        "mechanisms": [
          "triangle_multiplication",
          "gated_projection",
          "residual_update"
        ],
        "role": "aggregate products over shared incoming edges and add the result to pair state",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "TriangleMultiplication.__call__ and PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_attention_starting_node",
        "parent_ref": "modules.pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Triangle Attention Starting Node",
        "kind": "attention",
        "mechanisms": [
          "axial_attention",
          "self_derived_pair_bias",
          "query_gating",
          "residual_update"
        ],
        "role": "update each ordered pair by attending along the starting-node pair-grid axis",
        "scale": "token_pair",
        "attention": {
          "pattern": "pair_grid_starting_node",
          "query_scale": "token_pair",
          "key_value_scale": "token_pair",
          "heads": 4,
          "pair_bias": true,
          "pair_bias_source": "normalized_pair_state",
          "positional_encoding": {
            "kind": "none"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "GridSelfAttention.__call__, GridSelfAttention._attention, and PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_attention_ending_node",
        "parent_ref": "modules.pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Triangle Attention Ending Node",
        "kind": "attention",
        "mechanisms": [
          "axial_attention",
          "self_derived_pair_bias",
          "query_gating",
          "residual_update"
        ],
        "role": "transpose the pair grid, attend along the complementary ending-node axis, and add the result to pair state",
        "scale": "token_pair",
        "attention": {
          "pattern": "pair_grid_ending_node",
          "query_scale": "token_pair",
          "key_value_scale": "token_pair",
          "heads": 4,
          "pair_bias": true,
          "pair_bias_source": "normalized_pair_state",
          "positional_encoding": {
            "kind": "none"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "GridSelfAttention.__call__, GridSelfAttention._attention, and PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_transition",
        "parent_ref": "modules.pair_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Pair Transition",
        "kind": "feed_forward",
        "mechanisms": [
          "layer_normalization",
          "swiglu",
          "residual_update"
        ],
        "role": "apply a pointwise 4x SwiGLU transition and add its 128-channel projection back to each pair entry",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "TransitionBlock.__call__ and PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "single_update_stage",
        "parent_ref": "modules.pairformer_stack",
        "decomposition": {
          "status": "complete"
        },
        "label": "Single Track Update",
        "kind": "refiner",
        "mechanisms": [
          "pair_logit_projection",
          "self_attention",
          "transition"
        ],
        "role": "use the updated pair state to bias token self-attention, then apply a token-wise transition",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "single_pair_logits_projection",
        "parent_ref": "modules.single_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Project Pair Attention Bias",
        "kind": "adapter",
        "mechanisms": [
          "layer_normalization",
          "linear_projection"
        ],
        "role": "normalize the updated pair state and project each token pair to 16 single-attention head logits",
        "scale": "token_pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "single_attention_with_pair_bias",
        "parent_ref": "modules.single_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Single Attention with Pair Bias",
        "kind": "attention",
        "mechanisms": [
          "full_attention",
          "pair_logit_bias",
          "query_gating",
          "residual_update"
        ],
        "role": "update each token state with 16-head self-attention whose logits receive the projected pair bias",
        "scale": "token",
        "attention": {
          "pattern": "full",
          "query_scale": "token",
          "key_value_scale": "token",
          "heads": 16,
          "pair_bias": true,
          "pair_bias_source": "updated_pair_state",
          "positional_encoding": {
            "kind": "none"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "callsite_evidence",
              "locator": "PairFormerIteration single_attention_ call"
            },
            {
              "source_ref": "af3_self_attention_code",
              "role": "implementation_evidence",
              "locator": "self_attention"
            }
          ]
        }
      },
      {
        "id": "single_transition",
        "parent_ref": "modules.single_update_stage",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Single Transition",
        "kind": "feed_forward",
        "mechanisms": [
          "layer_normalization",
          "swiglu",
          "residual_update"
        ],
        "role": "apply a pointwise 4x SwiGLU transition and add its 384-channel projection back to each token state",
        "scale": "token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "TransitionBlock.__call__ and PairFormerIteration.__call__"
            }
          ]
        }
      }
    ],
    "blockInstances": [

    ],
    "representations": [
      {
        "id": "single_state",
        "scale": "token",
        "semantic_role": "mutable token-wise trunk representation",
        "shape": "N_token x 384",
        "glyph": "single",
        "carries": [
          "token context",
          "trunk single features"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "seq_channel=384 and single_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "pair_state",
        "scale": "token_pair",
        "semantic_role": "mutable ordered token-pair trunk representation",
        "shape": "N_token x N_token x 128",
        "glyph": "pair",
        "carries": [
          "pairwise token context",
          "relational geometry evidence"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "pair_channel=128 and pair_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "token_mask",
        "scale": "token",
        "semantic_role": "valid-token mask for single attention",
        "shape": "N_token",
        "glyph": "vector",
        "carries": [
          "token validity"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "shape_evidence",
              "locator": "PairFormerIteration.__call__ seq_mask argument"
            }
          ]
        }
      },
      {
        "id": "pair_mask",
        "scale": "token_pair",
        "semantic_role": "valid-token-pair mask for pair updates",
        "shape": "N_token x N_token",
        "glyph": "matrix",
        "carries": [
          "pair validity"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "shape_evidence",
              "locator": "PairFormerIteration.__call__ pair_mask argument"
            }
          ]
        }
      },
      {
        "id": "pair_attention_logits",
        "scale": "token_pair",
        "semantic_role": "per-head additive bias for token self-attention",
        "shape": "16 x N_token x N_token",
        "glyph": "volume",
        "carries": [
          "pair-derived attention logits"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "shape_evidence",
              "locator": "single_pair_logits_projection and transpose"
            },
            {
              "source_ref": "af3_self_attention_code",
              "role": "configuration_evidence",
              "locator": "SelfAttentionConfig.num_head=16"
            }
          ]
        }
      }
    ],
    "valueSites": [
      {
        "id": "single_state_input",
        "representation_ref": "representations.single_state",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "component_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "seq_channel=384 and single_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "pair_state_input",
        "representation_ref": "representations.pair_state",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "component_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "pair_channel=128 and pair_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "token_mask_input",
        "representation_ref": "representations.token_mask",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "component_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_mask_input",
        "representation_ref": "representations.pair_mask",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "component_input",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "block_pair_state",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.pairformer_stack",
        "role": "pairformer_block_pair_read",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "pair_channel=128 and pair_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "pair_after_outgoing_multiplication",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.pair_update_stage",
        "role": "outgoing_triangle_updated_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_after_incoming_multiplication",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.pair_update_stage",
        "role": "incoming_triangle_updated_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_after_starting_attention",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.pair_update_stage",
        "role": "starting_node_attention_updated_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_after_ending_attention",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.pair_update_stage",
        "role": "ending_node_attention_updated_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_after_transition",
        "representation_ref": "representations.pair_state",
        "scope_ref": "modules.pairformer_stack",
        "role": "pairformer_block_pair_write",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "pair_channel=128 and pair_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "block_single_state",
        "representation_ref": "representations.single_state",
        "scope_ref": "modules.pairformer_stack",
        "role": "pairformer_block_single_read",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "seq_channel=384 and single_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "single_pair_attention_logits",
        "representation_ref": "representations.pair_attention_logits",
        "scope_ref": "modules.single_update_stage",
        "role": "pair_derived_single_attention_bias",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "single_after_pair_attention",
        "representation_ref": "representations.single_state",
        "scope_ref": "modules.single_update_stage",
        "role": "attention_updated_single_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "seq_channel=384 and single_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "single_after_transition",
        "representation_ref": "representations.single_state",
        "scope_ref": "modules.pairformer_stack",
        "role": "pairformer_block_single_write",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "seq_channel=384 and single_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "single_state_output",
        "representation_ref": "representations.single_state",
        "scope_ref": "architecture",
        "boundary": "output",
        "role": "component_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "seq_channel=384 and single_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "pair_state_output",
        "representation_ref": "representations.pair_state",
        "scope_ref": "architecture",
        "boundary": "output",
        "role": "component_output",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "shape_evidence",
              "locator": "pair_channel=128 and pair_activations shape assertion"
            },
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a"
            }
          ]
        }
      }
    ],
    "valueSiteInterfaces": {
      "single_state_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.input_single_state_initializes_block_single_state"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "value_sites.block_single_state"
        ]
      },
      "pair_state_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.input_pair_state_initializes_block_pair_state"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "value_sites.block_pair_state"
        ]
      },
      "token_mask_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.token_mask_conditions_single_attention"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.single_attention_with_pair_bias"
        ]
      },
      "pair_mask_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.pair_mask_conditions_outgoing_multiplication",
          "relations.pair_mask_conditions_incoming_multiplication",
          "relations.pair_mask_conditions_starting_attention",
          "relations.pair_mask_conditions_ending_attention"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.triangle_multiplication_outgoing",
          "modules.triangle_multiplication_incoming",
          "modules.pair_attention_starting_node",
          "modules.pair_attention_ending_node"
        ]
      },
      "block_pair_state": {
        "incomingRelationRefs": [
          "relations.input_pair_state_initializes_block_pair_state",
          "relations.block_pair_output_reenters_next_pairformer_block"
        ],
        "outgoingRelationRefs": [
          "relations.block_pair_state_enters_outgoing_multiplication"
        ],
        "producerRefs": [
          "value_sites.pair_state_input",
          "value_sites.pair_after_transition"
        ],
        "consumerRefs": [
          "modules.triangle_multiplication_outgoing"
        ]
      },
      "pair_after_outgoing_multiplication": {
        "incomingRelationRefs": [
          "relations.outgoing_multiplication_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.outgoing_pair_state_enters_incoming_multiplication"
        ],
        "producerRefs": [
          "modules.triangle_multiplication_outgoing"
        ],
        "consumerRefs": [
          "modules.triangle_multiplication_incoming"
        ]
      },
      "pair_after_incoming_multiplication": {
        "incomingRelationRefs": [
          "relations.incoming_multiplication_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.incoming_pair_state_enters_starting_attention"
        ],
        "producerRefs": [
          "modules.triangle_multiplication_incoming"
        ],
        "consumerRefs": [
          "modules.pair_attention_starting_node"
        ]
      },
      "pair_after_starting_attention": {
        "incomingRelationRefs": [
          "relations.starting_attention_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.starting_pair_state_enters_ending_attention"
        ],
        "producerRefs": [
          "modules.pair_attention_starting_node"
        ],
        "consumerRefs": [
          "modules.pair_attention_ending_node"
        ]
      },
      "pair_after_ending_attention": {
        "incomingRelationRefs": [
          "relations.ending_attention_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.ending_pair_state_enters_pair_transition"
        ],
        "producerRefs": [
          "modules.pair_attention_ending_node"
        ],
        "consumerRefs": [
          "modules.pair_transition"
        ]
      },
      "pair_after_transition": {
        "incomingRelationRefs": [
          "relations.pair_transition_updates_pair_state"
        ],
        "outgoingRelationRefs": [
          "relations.updated_pair_state_enters_bias_projection",
          "relations.block_pair_output_reenters_next_pairformer_block",
          "relations.final_pair_block_state_becomes_output"
        ],
        "producerRefs": [
          "modules.pair_transition"
        ],
        "consumerRefs": [
          "modules.single_pair_logits_projection",
          "value_sites.block_pair_state",
          "value_sites.pair_state_output"
        ]
      },
      "block_single_state": {
        "incomingRelationRefs": [
          "relations.input_single_state_initializes_block_single_state",
          "relations.block_single_output_reenters_next_pairformer_block"
        ],
        "outgoingRelationRefs": [
          "relations.block_single_state_enters_pair_biased_attention"
        ],
        "producerRefs": [
          "value_sites.single_state_input",
          "value_sites.single_after_transition"
        ],
        "consumerRefs": [
          "modules.single_attention_with_pair_bias"
        ]
      },
      "single_pair_attention_logits": {
        "incomingRelationRefs": [
          "relations.bias_projection_produces_pair_logits"
        ],
        "outgoingRelationRefs": [
          "relations.pair_logits_bias_single_attention"
        ],
        "producerRefs": [
          "modules.single_pair_logits_projection"
        ],
        "consumerRefs": [
          "modules.single_attention_with_pair_bias"
        ]
      },
      "single_after_pair_attention": {
        "incomingRelationRefs": [
          "relations.pair_biased_attention_updates_single_state"
        ],
        "outgoingRelationRefs": [
          "relations.attention_updated_single_enters_transition"
        ],
        "producerRefs": [
          "modules.single_attention_with_pair_bias"
        ],
        "consumerRefs": [
          "modules.single_transition"
        ]
      },
      "single_after_transition": {
        "incomingRelationRefs": [
          "relations.single_transition_updates_single_state"
        ],
        "outgoingRelationRefs": [
          "relations.block_single_output_reenters_next_pairformer_block",
          "relations.final_single_block_state_becomes_output"
        ],
        "producerRefs": [
          "modules.single_transition"
        ],
        "consumerRefs": [
          "value_sites.block_single_state",
          "value_sites.single_state_output"
        ]
      },
      "single_state_output": {
        "incomingRelationRefs": [
          "relations.final_single_block_state_becomes_output"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "value_sites.single_after_transition"
        ],
        "consumerRefs": [

        ]
      },
      "pair_state_output": {
        "incomingRelationRefs": [
          "relations.final_pair_block_state_becomes_output"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "value_sites.pair_after_transition"
        ],
        "consumerRefs": [

        ]
      }
    },
    "execution": {
      "loops": [
        {
          "id": "pairformer_stack",
          "repeats": 48,
          "reruns": [
            "modules.triangle_multiplication_outgoing",
            "modules.triangle_multiplication_incoming",
            "modules.pair_attention_starting_node",
            "modules.pair_attention_ending_node",
            "modules.pair_transition",
            "modules.single_pair_logits_projection",
            "modules.single_attention_with_pair_bias",
            "modules.single_transition"
          ],
          "cached": [
            "value_sites.token_mask_input",
            "value_sites.pair_mask_input"
          ],
          "notes": [
            "Each block has an independent parameter set; this is a depth stack, not weight sharing across 48 iterations.",
            "The pair track is fully updated before that block's pair state conditions the single-track attention."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "af3_evoformer_code",
                "role": "configuration_evidence",
                "locator": "Evoformer.Config.pairformer and hk.experimental.layer_stack"
              },
              {
                "source_ref": "af3_pairformer_code",
                "role": "implementation_evidence",
                "locator": "PairFormerIteration.__call__"
              }
            ]
          }
        }
      ]
    },
    "stateSemantics": {
      "pair_state": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      "single_state": {
        "representation_ref": "representations.single_state",
        "value_site_refs": [
          "value_sites.single_state_input",
          "value_sites.block_single_state",
          "value_sites.single_after_pair_attention",
          "value_sites.single_after_transition",
          "value_sites.single_state_output"
        ],
        "lifecycle": "refined_after_pair_track_in_each_block",
        "notes": [
          "The updated pair state affects the single state through attention logits; the single state is not written back into the pair state in the same Pairformer block."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__ with with_single=True"
            }
          ]
        }
      },
      "pair_attention_logits": {
        "representation_ref": "representations.pair_attention_logits",
        "value_site_refs": [
          "value_sites.single_pair_attention_logits"
        ],
        "lifecycle": "rebuilt_from_updated_pair_state_in_each_block",
        "notes": [
          "These 16-head logits bias single self-attention and are not a persistent state track."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "single_pair_logits_norm and single_pair_logits_projection"
            }
          ]
        }
      },
      "token_mask": {
        "representation_ref": "representations.token_mask",
        "value_site_refs": [
          "value_sites.token_mask_input"
        ],
        "lifecycle": "cached_read_only_mask",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "seq_mask passed to PairFormerIteration"
            }
          ]
        }
      },
      "pair_mask": {
        "representation_ref": "representations.pair_mask",
        "value_site_refs": [
          "value_sites.pair_mask_input"
        ],
        "lifecycle": "cached_read_only_mask",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pair_mask passed to PairFormerIteration"
            }
          ]
        }
      }
    },
    "stateSemanticsBySite": {
      "pair_state_input": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "block_pair_state": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_after_outgoing_multiplication": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_after_incoming_multiplication": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_after_starting_attention": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_after_ending_attention": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_after_transition": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "pair_state_output": {
        "representation_ref": "representations.pair_state",
        "value_site_refs": [
          "value_sites.pair_state_input",
          "value_sites.block_pair_state",
          "value_sites.pair_after_outgoing_multiplication",
          "value_sites.pair_after_incoming_multiplication",
          "value_sites.pair_after_starting_attention",
          "value_sites.pair_after_ending_attention",
          "value_sites.pair_after_transition",
          "value_sites.pair_state_output"
        ],
        "lifecycle": "refined_across_five_pair_updates_per_block",
        "notes": [
          "Every operation returns an additive delta; PairFormerIteration applies the residual update before the next operation."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "groupId": "pair_state"
      },
      "single_state_input": {
        "representation_ref": "representations.single_state",
        "value_site_refs": [
          "value_sites.single_state_input",
          "value_sites.block_single_state",
          "value_sites.single_after_pair_attention",
          "value_sites.single_after_transition",
          "value_sites.single_state_output"
        ],
        "lifecycle": "refined_after_pair_track_in_each_block",
        "notes": [
          "The updated pair state affects the single state through attention logits; the single state is not written back into the pair state in the same Pairformer block."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__ with with_single=True"
            }
          ]
        },
        "groupId": "single_state"
      },
      "block_single_state": {
        "representation_ref": "representations.single_state",
        "value_site_refs": [
          "value_sites.single_state_input",
          "value_sites.block_single_state",
          "value_sites.single_after_pair_attention",
          "value_sites.single_after_transition",
          "value_sites.single_state_output"
        ],
        "lifecycle": "refined_after_pair_track_in_each_block",
        "notes": [
          "The updated pair state affects the single state through attention logits; the single state is not written back into the pair state in the same Pairformer block."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__ with with_single=True"
            }
          ]
        },
        "groupId": "single_state"
      },
      "single_after_pair_attention": {
        "representation_ref": "representations.single_state",
        "value_site_refs": [
          "value_sites.single_state_input",
          "value_sites.block_single_state",
          "value_sites.single_after_pair_attention",
          "value_sites.single_after_transition",
          "value_sites.single_state_output"
        ],
        "lifecycle": "refined_after_pair_track_in_each_block",
        "notes": [
          "The updated pair state affects the single state through attention logits; the single state is not written back into the pair state in the same Pairformer block."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__ with with_single=True"
            }
          ]
        },
        "groupId": "single_state"
      },
      "single_after_transition": {
        "representation_ref": "representations.single_state",
        "value_site_refs": [
          "value_sites.single_state_input",
          "value_sites.block_single_state",
          "value_sites.single_after_pair_attention",
          "value_sites.single_after_transition",
          "value_sites.single_state_output"
        ],
        "lifecycle": "refined_after_pair_track_in_each_block",
        "notes": [
          "The updated pair state affects the single state through attention logits; the single state is not written back into the pair state in the same Pairformer block."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__ with with_single=True"
            }
          ]
        },
        "groupId": "single_state"
      },
      "single_state_output": {
        "representation_ref": "representations.single_state",
        "value_site_refs": [
          "value_sites.single_state_input",
          "value_sites.block_single_state",
          "value_sites.single_after_pair_attention",
          "value_sites.single_after_transition",
          "value_sites.single_state_output"
        ],
        "lifecycle": "refined_after_pair_track_in_each_block",
        "notes": [
          "The updated pair state affects the single state through attention logits; the single state is not written back into the pair state in the same Pairformer block."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__ with with_single=True"
            }
          ]
        },
        "groupId": "single_state"
      },
      "single_pair_attention_logits": {
        "representation_ref": "representations.pair_attention_logits",
        "value_site_refs": [
          "value_sites.single_pair_attention_logits"
        ],
        "lifecycle": "rebuilt_from_updated_pair_state_in_each_block",
        "notes": [
          "These 16-head logits bias single self-attention and are not a persistent state track."
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "single_pair_logits_norm and single_pair_logits_projection"
            }
          ]
        },
        "groupId": "pair_attention_logits"
      },
      "token_mask_input": {
        "representation_ref": "representations.token_mask",
        "value_site_refs": [
          "value_sites.token_mask_input"
        ],
        "lifecycle": "cached_read_only_mask",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "seq_mask passed to PairFormerIteration"
            }
          ]
        },
        "groupId": "token_mask"
      },
      "pair_mask_input": {
        "representation_ref": "representations.pair_mask",
        "value_site_refs": [
          "value_sites.pair_mask_input"
        ],
        "lifecycle": "cached_read_only_mask",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pair_mask passed to PairFormerIteration"
            }
          ]
        },
        "groupId": "pair_mask"
      }
    },
    "conditioning": [
      {
        "id": "outgoing_pair_mask",
        "relation_ref": "relations.pair_mask_conditions_outgoing_multiplication",
        "mode": "padding_mask",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "source": "value_sites.pair_mask_input",
        "target": "modules.triangle_multiplication_outgoing"
      },
      {
        "id": "incoming_pair_mask",
        "relation_ref": "relations.pair_mask_conditions_incoming_multiplication",
        "mode": "padding_mask",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "source": "value_sites.pair_mask_input",
        "target": "modules.triangle_multiplication_incoming"
      },
      {
        "id": "starting_attention_pair_mask",
        "relation_ref": "relations.pair_mask_conditions_starting_attention",
        "mode": "attention_mask",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "source": "value_sites.pair_mask_input",
        "target": "modules.pair_attention_starting_node"
      },
      {
        "id": "ending_attention_pair_mask",
        "relation_ref": "relations.pair_mask_conditions_ending_attention",
        "mode": "attention_mask",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "source": "value_sites.pair_mask_input",
        "target": "modules.pair_attention_ending_node"
      },
      {
        "id": "single_attention_token_mask",
        "relation_ref": "relations.token_mask_conditions_single_attention",
        "mode": "attention_mask",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_self_attention_code",
              "role": "implementation_evidence",
              "locator": "self_attention mask bias"
            }
          ]
        },
        "source": "value_sites.token_mask_input",
        "target": "modules.single_attention_with_pair_bias"
      },
      {
        "id": "updated_pair_biases_single_attention",
        "relation_ref": "relations.pair_logits_bias_single_attention",
        "mode": "pair_logit_bias",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "single_pair_logits_projection and self_attention pair_logits argument"
            }
          ]
        },
        "source": "value_sites.single_pair_attention_logits",
        "target": "modules.single_attention_with_pair_bias"
      },
      {
        "id": "updated_pair_enters_bias_projection",
        "relation_ref": "relations.updated_pair_state_enters_bias_projection",
        "mode": "pair_logit_bias_source",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "source": "value_sites.pair_after_transition",
        "target": "modules.single_pair_logits_projection"
      },
      {
        "id": "projected_pair_logits",
        "relation_ref": "relations.bias_projection_produces_pair_logits",
        "mode": "pair_logit_projection",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        },
        "source": "modules.single_pair_logits_projection",
        "target": "value_sites.single_pair_attention_logits"
      }
    ],
    "scaleTransitions": [

    ],
    "trainingInference": {
      "objective": {
        "kind": "component_only",
        "notes": [
          "The Pairformer is trained as part of the complete AlphaFold 3 system; this bounded diagram does not assign it a standalone loss."
        ]
      },
      "schedule": {
        "kind": "none"
      },
      "sampler": {
        "kind": "none"
      },
      "teacher_forcing": "not_applicable",
      "self_conditioning": "none",
      "checkpoint_notes": [
        "The released implementation applies the same deterministic Pairformer computation in training and inference; upstream recycling is outside this diagram."
      ],
      "evidence": {
        "status": "confirmed_from_code",
        "refs": [
          {
            "source_ref": "af3_evoformer_code",
            "role": "implementation_evidence",
            "locator": "Evoformer.__call__ pairformer_stack"
          }
        ]
      }
    },
    "relations": [
      {
        "id": "input_pair_state_initializes_block_pair_state",
        "from": "value_sites.pair_state_input",
        "to": "value_sites.block_pair_state",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "initialize_pairformer_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "input_single_state_initializes_block_single_state",
        "from": "value_sites.single_state_input",
        "to": "value_sites.block_single_state",
        "kind": "state_update",
        "carries": [
          "representations.single_state"
        ],
        "operation": "initialize_pairformer_single_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "block_pair_state_enters_outgoing_multiplication",
        "from": "value_sites.block_pair_state",
        "to": "modules.triangle_multiplication_outgoing",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "compute_outgoing_triangle_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_mask_conditions_outgoing_multiplication",
        "from": "value_sites.pair_mask_input",
        "to": "modules.triangle_multiplication_outgoing",
        "kind": "conditioning",
        "carries": [
          "representations.pair_mask"
        ],
        "operation": "mask_outgoing_triangle_inputs",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "outgoing_multiplication_updates_pair_state",
        "from": "modules.triangle_multiplication_outgoing",
        "to": "value_sites.pair_after_outgoing_multiplication",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_outgoing_triangle_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "outgoing_pair_state_enters_incoming_multiplication",
        "from": "value_sites.pair_after_outgoing_multiplication",
        "to": "modules.triangle_multiplication_incoming",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "compute_incoming_triangle_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_mask_conditions_incoming_multiplication",
        "from": "value_sites.pair_mask_input",
        "to": "modules.triangle_multiplication_incoming",
        "kind": "conditioning",
        "carries": [
          "representations.pair_mask"
        ],
        "operation": "mask_incoming_triangle_inputs",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "incoming_multiplication_updates_pair_state",
        "from": "modules.triangle_multiplication_incoming",
        "to": "value_sites.pair_after_incoming_multiplication",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_incoming_triangle_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "incoming_pair_state_enters_starting_attention",
        "from": "value_sites.pair_after_incoming_multiplication",
        "to": "modules.pair_attention_starting_node",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "attend_along_starting_node_axis",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_mask_conditions_starting_attention",
        "from": "value_sites.pair_mask_input",
        "to": "modules.pair_attention_starting_node",
        "kind": "conditioning",
        "carries": [
          "representations.pair_mask"
        ],
        "operation": "mask_starting_node_attention",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "starting_attention_updates_pair_state",
        "from": "modules.pair_attention_starting_node",
        "to": "value_sites.pair_after_starting_attention",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_starting_node_attention_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "starting_pair_state_enters_ending_attention",
        "from": "value_sites.pair_after_starting_attention",
        "to": "modules.pair_attention_ending_node",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "attend_along_ending_node_axis",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_mask_conditions_ending_attention",
        "from": "value_sites.pair_mask_input",
        "to": "modules.pair_attention_ending_node",
        "kind": "conditioning",
        "carries": [
          "representations.pair_mask"
        ],
        "operation": "mask_ending_node_attention",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "ending_attention_updates_pair_state",
        "from": "modules.pair_attention_ending_node",
        "to": "value_sites.pair_after_ending_attention",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_ending_node_attention_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "ending_pair_state_enters_pair_transition",
        "from": "value_sites.pair_after_ending_attention",
        "to": "modules.pair_transition",
        "kind": "data_flow",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "compute_pair_transition_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_transition_updates_pair_state",
        "from": "modules.pair_transition",
        "to": "value_sites.pair_after_transition",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "add_pair_transition_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "updated_pair_state_enters_bias_projection",
        "from": "value_sites.pair_after_transition",
        "to": "modules.single_pair_logits_projection",
        "kind": "conditioning",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "normalize_and_project_pair_logits",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "bias_projection_produces_pair_logits",
        "from": "modules.single_pair_logits_projection",
        "to": "value_sites.single_pair_attention_logits",
        "kind": "conditioning",
        "carries": [
          "representations.pair_attention_logits"
        ],
        "operation": "project_sixteen_attention_logits",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "block_single_state_enters_pair_biased_attention",
        "from": "value_sites.block_single_state",
        "to": "modules.single_attention_with_pair_bias",
        "kind": "data_flow",
        "carries": [
          "representations.single_state"
        ],
        "operation": "project_single_queries_keys_values",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_logits_bias_single_attention",
        "from": "value_sites.single_pair_attention_logits",
        "to": "modules.single_attention_with_pair_bias",
        "kind": "conditioning",
        "carries": [
          "representations.pair_attention_logits"
        ],
        "operation": "add_pair_logits_to_attention_scores",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "token_mask_conditions_single_attention",
        "from": "value_sites.token_mask_input",
        "to": "modules.single_attention_with_pair_bias",
        "kind": "conditioning",
        "carries": [
          "representations.token_mask"
        ],
        "operation": "mask_invalid_attention_keys",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_biased_attention_updates_single_state",
        "from": "modules.single_attention_with_pair_bias",
        "to": "value_sites.single_after_pair_attention",
        "kind": "state_update",
        "carries": [
          "representations.single_state"
        ],
        "operation": "add_single_attention_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "attention_updated_single_enters_transition",
        "from": "value_sites.single_after_pair_attention",
        "to": "modules.single_transition",
        "kind": "data_flow",
        "carries": [
          "representations.single_state"
        ],
        "operation": "compute_single_transition_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "single_transition_updates_single_state",
        "from": "modules.single_transition",
        "to": "value_sites.single_after_transition",
        "kind": "state_update",
        "carries": [
          "representations.single_state"
        ],
        "operation": "add_single_transition_delta",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "block_pair_output_reenters_next_pairformer_block",
        "from": "value_sites.pair_after_transition",
        "to": "value_sites.block_pair_state",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "advance_pair_state_to_next_block",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "block_single_output_reenters_next_pairformer_block",
        "from": "value_sites.single_after_transition",
        "to": "value_sites.block_single_state",
        "kind": "state_update",
        "carries": [
          "representations.single_state"
        ],
        "operation": "advance_single_state_to_next_block",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "final_pair_block_state_becomes_output",
        "from": "value_sites.pair_after_transition",
        "to": "value_sites.pair_state_output",
        "kind": "state_update",
        "carries": [
          "representations.pair_state"
        ],
        "operation": "expose_final_pair_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "final_single_block_state_becomes_output",
        "from": "value_sites.single_after_transition",
        "to": "value_sites.single_state_output",
        "kind": "state_update",
        "carries": [
          "representations.single_state"
        ],
        "operation": "expose_final_single_state",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_evoformer_code",
              "role": "implementation_evidence",
              "locator": "pairformer_stack input and output"
            },
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      }
    ],
    "claims": [
      {
        "id": "pairformer_has_no_msa_state",
        "statement": "The Pairformer boundary retains only pair and single token representations; MSA processing occurs earlier in the AF3 trunk.",
        "scope": {
          "module_ref": "modules.pairformer_stack"
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Network architecture and training; Fig. 2a"
            }
          ]
        }
      },
      {
        "id": "pair_track_precedes_single_track",
        "statement": "Within each block, all five pair updates finish before the updated pair state is projected into logits for single self-attention.",
        "scope": {
          "module_ref": "modules.pairformer_stack"
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "pair_state_does_not_receive_single_update",
        "statement": "The released AF3 Pairformer iteration updates single state from pair-derived attention logits but does not inject the updated single state back into pair state within that block.",
        "scope": {
          "module_ref": "modules.pairformer_stack"
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "source_ref": "af3_pairformer_code",
              "role": "implementation_evidence",
              "locator": "PairFormerIteration.__call__"
            }
          ]
        }
      },
      {
        "id": "blocks_have_independent_weights",
        "statement": "The 48 Pairformer blocks have independent trainable parameters rather than sharing one block's weights.",
        "scope": {
          "module_ref": "modules.pairformer_stack"
        },
        "evidence": {
          "status": "confirmed_from_paper",
          "refs": [
            {
              "source_ref": "af3_2024",
              "role": "paper_evidence",
              "locator": "Fig. 2a caption"
            }
          ]
        }
      }
    ],
    "openQuestions": [

    ]
  },
  "bibliography": {
    "schemaVersion": "bibliography-v0.1",
    "sourceYaml": "../../references/bibliography.yaml",
    "sources": [
      {
        "id": "dit_2022",
        "kind": "paper",
        "title": "Scalable Diffusion Models with Transformers",
        "authors": [
          "William Peebles",
          "Saining Xie"
        ],
        "year": 2022,
        "identifiers": {
          "arxiv": "2212.09748"
        },
        "url": "https://arxiv.org/abs/2212.09748",
        "href": "https://arxiv.org/abs/2212.09748"
      },
      {
        "id": "dit_models_code",
        "kind": "code",
        "title": "DiT model implementation",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/models.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/models.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/models.py"
      },
      {
        "id": "dit_sample_code",
        "kind": "code",
        "title": "DiT sampling entry point",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/sample.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/sample.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/sample.py"
      },
      {
        "id": "dit_gaussian_diffusion_code",
        "kind": "code",
        "title": "DiT Gaussian diffusion implementation",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/diffusion/gaussian_diffusion.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/diffusion/gaussian_diffusion.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/diffusion/gaussian_diffusion.py"
      },
      {
        "id": "dit_train_code",
        "kind": "code",
        "title": "DiT training entry point",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "revision": "ed81ce2229091fd4ecc9a223645f95cf379d582b",
        "path": "facebookresearch/DiT/train.py",
        "url": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/train.py",
        "href": "https://github.com/facebookresearch/DiT/blob/ed81ce2229091fd4ecc9a223645f95cf379d582b/train.py"
      },
      {
        "id": "af2_2021",
        "kind": "paper",
        "title": "Highly accurate protein structure prediction with AlphaFold",
        "authors": [
          "John Jumper",
          "Richard Evans",
          "Alexander Pritzel",
          "Tim Green",
          "Michael Figurnov",
          "Olaf Ronneberger",
          "Kathryn Tunyasuvunakool",
          "Russ Bates",
          "Augustin Zidek",
          "Anna Potapenko",
          "Alex Bridgland",
          "Clemens Meyer",
          "Simon A. A. Kohl",
          "Andrew J. Ballard",
          "Andrew Cowie",
          "Bernardino Romera-Paredes",
          "Stanislav Nikolov",
          "Rishub Jain",
          "Jonas Adler",
          "Trevor Back",
          "Stig Petersen",
          "David Reiman",
          "Ellen Clancy",
          "Michal Zielinski",
          "Martin Steinegger",
          "Michalina Pacholska",
          "Tamas Berghammer",
          "Sebastian Bodenstein",
          "David Silver",
          "Oriol Vinyals",
          "Andrew W. Senior",
          "Koray Kavukcuoglu",
          "Pushmeet Kohli",
          "Demis Hassabis"
        ],
        "year": 2021,
        "identifiers": {
          "doi": "10.1038/s41586-021-03819-2"
        },
        "url": "https://www.nature.com/articles/s41586-021-03819-2",
        "href": "https://www.nature.com/articles/s41586-021-03819-2"
      },
      {
        "id": "af2_2021_supplement",
        "kind": "paper",
        "title": "Highly accurate protein structure prediction with AlphaFold: Supplementary Information",
        "authors": [
          "John Jumper",
          "Richard Evans",
          "Alexander Pritzel",
          "Tim Green",
          "Michael Figurnov",
          "Olaf Ronneberger",
          "Kathryn Tunyasuvunakool",
          "Russ Bates",
          "Augustin Zidek",
          "Anna Potapenko",
          "Alex Bridgland",
          "Clemens Meyer",
          "Simon A. A. Kohl",
          "Andrew J. Ballard",
          "Andrew Cowie",
          "Bernardino Romera-Paredes",
          "Stanislav Nikolov",
          "Rishub Jain",
          "Jonas Adler",
          "Trevor Back",
          "Stig Petersen",
          "David Reiman",
          "Ellen Clancy",
          "Michal Zielinski",
          "Martin Steinegger",
          "Michalina Pacholska",
          "Tamas Berghammer",
          "Sebastian Bodenstein",
          "David Silver",
          "Oriol Vinyals",
          "Andrew W. Senior",
          "Koray Kavukcuoglu",
          "Pushmeet Kohli",
          "Demis Hassabis"
        ],
        "year": 2021,
        "identifiers": {
          "doi": "10.1038/s41586-021-03819-2",
          "component": "supplementary_information"
        },
        "url": "https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-021-03819-2/MediaObjects/41586_2021_3819_MOESM1_ESM.pdf",
        "href": "https://static-content.springer.com/esm/art%3A10.1038%2Fs41586-021-03819-2/MediaObjects/41586_2021_3819_MOESM1_ESM.pdf"
      },
      {
        "id": "af2_runner_code",
        "kind": "code",
        "title": "AlphaFold prediction and ranking entry point",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "run_alphafold.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/run_alphafold.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/run_alphafold.py"
      },
      {
        "id": "af2_data_pipeline_code",
        "kind": "code",
        "title": "AlphaFold monomer input feature pipeline",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/data/pipeline.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/data/pipeline.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/data/pipeline.py"
      },
      {
        "id": "af2_model_wrapper_code",
        "kind": "code",
        "title": "AlphaFold model runner and monomer selection wrapper",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/model.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/model.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/model.py"
      },
      {
        "id": "af2_model_code",
        "kind": "code",
        "title": "AlphaFold monomer model and recycling implementation",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/modules.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/modules.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/modules.py"
      },
      {
        "id": "af2_structure_code",
        "kind": "code",
        "title": "AlphaFold monomer structure module",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/folding.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/folding.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/folding.py"
      },
      {
        "id": "af2_config_code",
        "kind": "code",
        "title": "AlphaFold model configuration",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/model/config.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/config.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/model/config.py"
      },
      {
        "id": "af2_relax_code",
        "kind": "code",
        "title": "AlphaFold Amber relaxation wrapper",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold",
        "revision": "09ed0c5d5a32d794ed9f78b70906cbeaff0ef439",
        "path": "alphafold/relax/relax.py",
        "url": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/relax/relax.py",
        "href": "https://github.com/google-deepmind/alphafold/blob/09ed0c5d5a32d794ed9f78b70906cbeaff0ef439/alphafold/relax/relax.py"
      },
      {
        "id": "af3_2024",
        "kind": "paper",
        "title": "Accurate structure prediction of biomolecular interactions with AlphaFold 3",
        "authors": [
          "Josh Abramson",
          "Jonas Adler",
          "Jack Dunger",
          "Richard Evans",
          "Tim Green",
          "Alexander Pritzel",
          "Olaf Ronneberger",
          "Lindsay Willmore",
          "Andrew J. Ballard",
          "Joshua Bambrick",
          "Sebastian W. Bodenstein",
          "David A. Evans",
          "Chia-Chun Hung",
          "Michael O'Neill",
          "David Reiman",
          "Kathryn Tunyasuvunakool",
          "Zachary Wu",
          "Akvile Zemgulyte",
          "Victor Bapst",
          "Pushmeet Kohli",
          "Max Jaderberg",
          "Demis Hassabis",
          "John M. Jumper"
        ],
        "year": 2024,
        "identifiers": {
          "doi": "10.1038/s41586-024-07487-w"
        },
        "url": "https://www.nature.com/articles/s41586-024-07487-w",
        "href": "https://www.nature.com/articles/s41586-024-07487-w"
      },
      {
        "id": "af3_pairformer_code",
        "kind": "code",
        "title": "AlphaFold 3 Pairformer iteration and pair-update implementation",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold3",
        "revision": "f3e86f27dfac16559d16f470bb2f9323eb357f1f",
        "path": "src/alphafold3/model/network/modules.py",
        "url": "https://github.com/google-deepmind/alphafold3/blob/f3e86f27dfac16559d16f470bb2f9323eb357f1f/src/alphafold3/model/network/modules.py",
        "href": "https://github.com/google-deepmind/alphafold3/blob/f3e86f27dfac16559d16f470bb2f9323eb357f1f/src/alphafold3/model/network/modules.py"
      },
      {
        "id": "af3_evoformer_code",
        "kind": "code",
        "title": "AlphaFold 3 trunk and Pairformer stack configuration",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold3",
        "revision": "f3e86f27dfac16559d16f470bb2f9323eb357f1f",
        "path": "src/alphafold3/model/network/evoformer.py",
        "url": "https://github.com/google-deepmind/alphafold3/blob/f3e86f27dfac16559d16f470bb2f9323eb357f1f/src/alphafold3/model/network/evoformer.py",
        "href": "https://github.com/google-deepmind/alphafold3/blob/f3e86f27dfac16559d16f470bb2f9323eb357f1f/src/alphafold3/model/network/evoformer.py"
      },
      {
        "id": "af3_self_attention_code",
        "kind": "code",
        "title": "AlphaFold 3 single self-attention implementation",
        "organization": "Google DeepMind",
        "repository": "google-deepmind/alphafold3",
        "revision": "f3e86f27dfac16559d16f470bb2f9323eb357f1f",
        "path": "src/alphafold3/model/network/diffusion_transformer.py",
        "url": "https://github.com/google-deepmind/alphafold3/blob/f3e86f27dfac16559d16f470bb2f9323eb357f1f/src/alphafold3/model/network/diffusion_transformer.py",
        "href": "https://github.com/google-deepmind/alphafold3/blob/f3e86f27dfac16559d16f470bb2f9323eb357f1f/src/alphafold3/model/network/diffusion_transformer.py"
      },
      {
        "id": "genie2_2024",
        "kind": "paper",
        "title": "Out of Many, One: Designing and Scaffolding Proteins at the Scale of the Structural Universe with Genie 2",
        "authors": [
          "Yeqing Lin",
          "Minji Lee",
          "Zhao Zhang",
          "Mohammed AlQuraishi"
        ],
        "year": 2024,
        "identifiers": {
          "arxiv": "2405.15489"
        },
        "url": "https://arxiv.org/abs/2405.15489",
        "href": "https://arxiv.org/abs/2405.15489"
      },
      {
        "id": "genie2_model_code",
        "kind": "code",
        "title": "Genie 2 denoiser composition",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/model.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/model.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/model.py"
      },
      {
        "id": "genie2_single_feature_code",
        "kind": "code",
        "title": "Genie 2 single-feature network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/single_feature_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/single_feature_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/single_feature_net.py"
      },
      {
        "id": "genie2_pair_feature_code",
        "kind": "code",
        "title": "Genie 2 pair-feature network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/pair_feature_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_feature_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_feature_net.py"
      },
      {
        "id": "genie2_pair_transform_code",
        "kind": "code",
        "title": "Genie 2 pair-transform network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/pair_transform_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_transform_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/pair_transform_net.py"
      },
      {
        "id": "genie2_structure_code",
        "kind": "code",
        "title": "Genie 2 equivariant structure network",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/structure_net.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/structure_net.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/structure_net.py"
      },
      {
        "id": "genie2_ipa_code",
        "kind": "code",
        "title": "Genie 2 invariant point attention module",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/model/modules/invariant_point_attention.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/modules/invariant_point_attention.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/model/modules/invariant_point_attention.py"
      },
      {
        "id": "genie2_sampler_code",
        "kind": "code",
        "title": "Genie 2 reverse-diffusion sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/sampler/base.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/base.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/base.py"
      },
      {
        "id": "genie2_scaffold_sampler_code",
        "kind": "code",
        "title": "Genie 2 motif-scaffolding sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/sampler/scaffold.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/scaffold.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/sampler/scaffold.py"
      },
      {
        "id": "genie2_training_code",
        "kind": "code",
        "title": "Genie 2 diffusion training step",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/diffusion/genie.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/diffusion/genie.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/diffusion/genie.py"
      },
      {
        "id": "genie2_config_code",
        "kind": "code",
        "title": "Genie 2 model and diffusion configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "genie/config.py",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/config.py",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/genie/config.py"
      },
      {
        "id": "genie2_base_config",
        "kind": "code",
        "title": "Genie 2 released base-checkpoint configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie2",
        "revision": "9a954578f7b5a39552545eebc6d4794447794c87",
        "path": "results/base/configuration",
        "url": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/results/base/configuration",
        "href": "https://github.com/aqlaboratory/genie2/blob/9a954578f7b5a39552545eebc6d4794447794c87/results/base/configuration"
      },
      {
        "id": "genie3_2026",
        "kind": "paper",
        "title": "Fast and Ultra-Capable Protein Design: Advancing the Frontier Through Atomistic SE(3)-Equivariance with Genie 3",
        "authors": [
          "Yeqing Lin",
          "Minji Lee",
          "Siddharth Vermani",
          "Yuwei Jiang",
          "Robbe De Cooman",
          "Bryan Spetko",
          "Mohammed AlQuraishi"
        ],
        "year": 2026,
        "identifiers": {
          "doi": "10.64898/2026.05.01.722168"
        },
        "url": "https://www.biorxiv.org/content/10.64898/2026.05.01.722168v1",
        "href": "https://www.biorxiv.org/content/10.64898/2026.05.01.722168v1"
      },
      {
        "id": "genie3_model_code",
        "kind": "code",
        "title": "Genie 3 V1 denoiser composition",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/implementation/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/implementation/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/implementation/v1.py"
      },
      {
        "id": "genie3_single_feature_code",
        "kind": "code",
        "title": "Genie 3 V1 single-feature embedder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/embedder/single/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/single/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/single/v1.py"
      },
      {
        "id": "genie3_pair_feature_code",
        "kind": "code",
        "title": "Genie 3 V1 pair-feature embedder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/embedder/pair/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/pair/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/embedder/pair/v1.py"
      },
      {
        "id": "genie3_latent_transformer_code",
        "kind": "code",
        "title": "Genie 3 latent transformer",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/latent/transformer.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/latent/transformer.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/latent/transformer.py"
      },
      {
        "id": "genie3_structure_code",
        "kind": "code",
        "title": "Genie 3 equivariant structure decoder",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/structure_net.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/structure_net.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/structure_net.py"
      },
      {
        "id": "genie3_ipa_code",
        "kind": "code",
        "title": "Genie 3 full and reduced invariant point attention modules",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/module/invariant_point_attention.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/invariant_point_attention.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/invariant_point_attention.py"
      },
      {
        "id": "genie3_transition_code",
        "kind": "code",
        "title": "Genie 3 transition modules",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/module/transition.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/transition.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/module/transition.py"
      },
      {
        "id": "genie3_sequence_code",
        "kind": "code",
        "title": "Genie 3 optional sequence head",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/model/sequence_net.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/sequence_net.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/model/sequence_net.py"
      },
      {
        "id": "genie3_geometry_code",
        "kind": "code",
        "title": "Genie 3 Frenet frame construction",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/utils/geo_utils.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/geo_utils.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/geo_utils.py"
      },
      {
        "id": "genie3_feature_code",
        "kind": "code",
        "title": "Genie 3 protein tokenization and conditioning features",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/utils/feat_utils.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/feat_utils.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/utils/feat_utils.py"
      },
      {
        "id": "genie3_feature_schema_code",
        "kind": "code",
        "title": "Genie 3 feature dictionary registry",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/np/features.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/np/features.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/np/features.py"
      },
      {
        "id": "genie3_sample_dataset_registry_code",
        "kind": "code",
        "title": "Genie 3 generation task-source router",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/data/sample_dataset/registry.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/data/sample_dataset/registry.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/data/sample_dataset/registry.py"
      },
      {
        "id": "genie3_diffusion_code",
        "kind": "code",
        "title": "Genie 3 DDPM training objective",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/ddpm.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/ddpm.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/ddpm.py"
      },
      {
        "id": "genie3_sampler_code",
        "kind": "code",
        "title": "Genie 3 base reverse-diffusion sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/sampler/sampler.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/sampler.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/sampler.py"
      },
      {
        "id": "genie3_ddim_code",
        "kind": "code",
        "title": "Genie 3 DDIM directional-scaling sampler",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/diffusion/sampler/ddim.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/ddim.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/diffusion/sampler/ddim.py"
      },
      {
        "id": "genie3_config_code",
        "kind": "code",
        "title": "Genie 3 V1 architecture configuration",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/config/model/v1.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/config/model/v1.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/config/model/v1.py"
      },
      {
        "id": "genie3_export_code",
        "kind": "code",
        "title": "Genie 3 generated-structure postprocessing",
        "organization": "AQLaboratory",
        "repository": "aqlaboratory/genie3",
        "revision": "d77ae5ac04212ff1e8b29b585859a3244c614804",
        "path": "src/genie3/generation/runner/postprocess.py",
        "url": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/runner/postprocess.py",
        "href": "https://github.com/aqlaboratory/genie3/blob/d77ae5ac04212ff1e8b29b585859a3244c614804/src/genie3/generation/runner/postprocess.py"
      },
      {
        "id": "generic_feature_refinement_source",
        "kind": "source",
        "title": "Generic Feature Refinement architecture source",
        "path": "architectures/generic-feature-refinement.yaml",
        "href": "../../architectures/generic-feature-refinement.yaml"
      },
      {
        "id": "architecture_language_protocol",
        "kind": "protocol",
        "title": "Architecture language protocol",
        "path": "protocol/architecture-language.md",
        "href": "../../protocol/architecture-language.md"
      }
    ]
  },
  "standardBlocks": {
  },
  "pseudocode": {
    "alphafold3_pairformer": {
      "schemaVersion": "pseudocode-v0.2",
      "compilerVersion": "semantic-pseudocode-compiler-v0.3",
      "id": "alphafold3_pairformer",
      "title": "AlphaFold 3 Pairformer Trace",
      "rootScope": "scopes.pairformer",
      "sources": [
        {
          "id": "pairformer_code",
          "source_ref": "af3_pairformer_code"
        },
        {
          "id": "evoformer_code",
          "source_ref": "af3_evoformer_code"
        },
        {
          "id": "single_attention_code",
          "source_ref": "af3_self_attention_code"
        }
      ],
      "scopes": [
        {
          "id": "pairformer",
          "ref": "scopes.pairformer",
          "label": "AlphaFold 3 Pairformer",
          "kind": "program",
          "parentRef": "pseudocode",
          "subjectRef": "architecture"
        },
        {
          "id": "stack",
          "ref": "scopes.stack",
          "label": "48-block Pairformer stack",
          "kind": "loop",
          "parentRef": "scopes.pairformer",
          "subjectRef": "modules.pairformer_stack",
          "executionRef": "execution.loops.pairformer_stack"
        },
        {
          "id": "pair_update",
          "ref": "scopes.pair_update",
          "label": "Pair-track update",
          "kind": "module",
          "parentRef": "scopes.stack",
          "subjectRef": "modules.pair_update_stage"
        },
        {
          "id": "single_update",
          "ref": "scopes.single_update",
          "label": "Single-track update",
          "kind": "module",
          "parentRef": "scopes.stack",
          "subjectRef": "modules.single_update_stage"
        }
      ],
      "symbols": [
        {
          "id": "input_single",
          "name": "s",
          "tex": "s",
          "type": "input",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.pairformer",
          "architectureRef": "value_sites.single_state_input"
        },
        {
          "id": "input_pair",
          "name": "z",
          "tex": "z",
          "type": "input",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pairformer",
          "architectureRef": "value_sites.pair_state_input"
        },
        {
          "id": "input_token_mask",
          "name": "token_mask",
          "type": "mask",
          "shape": "N_token",
          "representationRef": "representations.token_mask",
          "scale": "token",
          "glyph": "vector",
          "scopeRef": "scopes.pairformer",
          "architectureRef": "value_sites.token_mask_input"
        },
        {
          "id": "input_pair_mask",
          "name": "pair_mask",
          "type": "mask",
          "shape": "N_token x N_token",
          "representationRef": "representations.pair_mask",
          "scale": "token_pair",
          "glyph": "matrix",
          "scopeRef": "scopes.pairformer",
          "architectureRef": "value_sites.pair_mask_input"
        },
        {
          "id": "output_single",
          "name": "s_trunk",
          "tex": "s^{trunk}",
          "type": "output",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.pairformer",
          "architectureRef": "value_sites.single_state_output"
        },
        {
          "id": "output_pair",
          "name": "z_trunk",
          "tex": "z^{trunk}",
          "type": "output",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pairformer",
          "architectureRef": "value_sites.pair_state_output"
        },
        {
          "id": "stack_single_input",
          "name": "s",
          "tex": "s",
          "type": "input",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.single_state_input"
        },
        {
          "id": "stack_pair_input",
          "name": "z",
          "tex": "z",
          "type": "input",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.pair_state_input"
        },
        {
          "id": "stack_token_mask",
          "name": "token_mask",
          "type": "mask",
          "shape": "N_token",
          "representationRef": "representations.token_mask",
          "scale": "token",
          "glyph": "vector",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.token_mask_input"
        },
        {
          "id": "stack_pair_mask",
          "name": "pair_mask",
          "type": "mask",
          "shape": "N_token x N_token",
          "representationRef": "representations.pair_mask",
          "scale": "token_pair",
          "glyph": "matrix",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.pair_mask_input"
        },
        {
          "id": "block_single",
          "name": "s_i",
          "tex": "s_i",
          "type": "state",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.block_single_state"
        },
        {
          "id": "block_pair",
          "name": "z_i",
          "tex": "z_i",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.block_pair_state"
        },
        {
          "id": "updated_pair",
          "name": "z_next",
          "tex": "z_{i+1}",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.pair_after_transition"
        },
        {
          "id": "updated_single",
          "name": "s_next",
          "tex": "s_{i+1}",
          "type": "state",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.single_after_transition"
        },
        {
          "id": "stack_output_single",
          "name": "s_trunk",
          "tex": "s^{trunk}",
          "type": "output",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.single_state_output"
        },
        {
          "id": "stack_output_pair",
          "name": "z_trunk",
          "tex": "z^{trunk}",
          "type": "output",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.stack",
          "architectureRef": "value_sites.pair_state_output"
        },
        {
          "id": "pair_input",
          "name": "z_i",
          "tex": "z_i",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pair_update",
          "architectureRef": "value_sites.block_pair_state"
        },
        {
          "id": "pair_scope_mask",
          "name": "pair_mask",
          "type": "mask",
          "shape": "N_token x N_token",
          "representationRef": "representations.pair_mask",
          "scale": "token_pair",
          "glyph": "matrix",
          "scopeRef": "scopes.pair_update",
          "architectureRef": "value_sites.pair_mask_input"
        },
        {
          "id": "pair_outgoing",
          "name": "z_out",
          "tex": "z^{out}",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pair_update",
          "architectureRef": "value_sites.pair_after_outgoing_multiplication"
        },
        {
          "id": "pair_incoming",
          "name": "z_in",
          "tex": "z^{in}",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pair_update",
          "architectureRef": "value_sites.pair_after_incoming_multiplication"
        },
        {
          "id": "pair_starting",
          "name": "z_start",
          "tex": "z^{start}",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pair_update",
          "architectureRef": "value_sites.pair_after_starting_attention"
        },
        {
          "id": "pair_ending",
          "name": "z_end",
          "tex": "z^{end}",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pair_update",
          "architectureRef": "value_sites.pair_after_ending_attention"
        },
        {
          "id": "pair_output",
          "name": "z_next",
          "tex": "z_{i+1}",
          "type": "state",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.pair_update",
          "architectureRef": "value_sites.pair_after_transition"
        },
        {
          "id": "single_input",
          "name": "s_i",
          "tex": "s_i",
          "type": "state",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.single_update",
          "architectureRef": "value_sites.block_single_state"
        },
        {
          "id": "single_pair_input",
          "name": "z_next",
          "tex": "z_{i+1}",
          "type": "representation",
          "shape": "N_token x N_token x 128",
          "representationRef": "representations.pair_state",
          "scale": "token_pair",
          "glyph": "pair",
          "scopeRef": "scopes.single_update",
          "architectureRef": "value_sites.pair_after_transition"
        },
        {
          "id": "single_scope_mask",
          "name": "token_mask",
          "type": "mask",
          "shape": "N_token",
          "representationRef": "representations.token_mask",
          "scale": "token",
          "glyph": "vector",
          "scopeRef": "scopes.single_update",
          "architectureRef": "value_sites.token_mask_input"
        },
        {
          "id": "pair_logits",
          "name": "pair_logits",
          "type": "conditioning",
          "shape": "16 x N_token x N_token",
          "representationRef": "representations.pair_attention_logits",
          "scale": "token_pair",
          "glyph": "volume",
          "scopeRef": "scopes.single_update",
          "architectureRef": "value_sites.single_pair_attention_logits"
        },
        {
          "id": "single_attention_state",
          "name": "s_attn",
          "tex": "s^{attn}",
          "type": "state",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.single_update",
          "architectureRef": "value_sites.single_after_pair_attention"
        },
        {
          "id": "single_output",
          "name": "s_next",
          "tex": "s_{i+1}",
          "type": "state",
          "shape": "N_token x 384",
          "representationRef": "representations.single_state",
          "scale": "token",
          "glyph": "single",
          "scopeRef": "scopes.single_update",
          "architectureRef": "value_sites.single_after_transition"
        }
      ],
      "lines": [
        {
          "id": "run_pairformer",
          "text": "s_trunk, z_trunk = PairformerStack(s, z, token_mask, pair_mask)",
          "comment": "The component boundary starts after AF3 has already embedded the token and pair inputs.",
          "refs": "pairformer_stack application",
          "sourceRefs": [
            {
              "source": "evoformer_code",
              "locator": "pairformer_stack application"
            }
          ],
          "scopeRef": "scopes.pairformer",
          "statementRef": "modules.pairformer_stack",
          "calleeScopeRef": "scopes.stack",
          "architectureRefs": [
            "modules.pairformer_stack",
            "claims.pairformer_has_no_msa_state"
          ],
          "operation": "run_pairformer_stack",
          "inputs": [
            "input_single",
            "input_pair",
            "input_token_mask",
            "input_pair_mask"
          ],
          "outputs": [
            "output_single",
            "output_pair"
          ],
          "codeBindings": [
            {
              "lexeme": "s_trunk",
              "access": "write",
              "symbolId": "output_single",
              "tex": "s^{trunk}",
              "architectureRef": "value_sites.single_state_output",
              "occurrences": [
                {
                  "start": 0,
                  "end": 7
                }
              ]
            },
            {
              "lexeme": "z_trunk",
              "access": "write",
              "symbolId": "output_pair",
              "tex": "z^{trunk}",
              "architectureRef": "value_sites.pair_state_output",
              "occurrences": [
                {
                  "start": 9,
                  "end": 16
                }
              ]
            },
            {
              "lexeme": "PairformerStack",
              "access": "call",
              "architectureRef": "modules.pairformer_stack",
              "occurrences": [
                {
                  "start": 19,
                  "end": 34
                }
              ]
            },
            {
              "lexeme": "s",
              "access": "read",
              "symbolId": "input_single",
              "tex": "s",
              "architectureRef": "value_sites.single_state_input",
              "occurrences": [
                {
                  "start": 35,
                  "end": 36
                }
              ]
            },
            {
              "lexeme": "z",
              "access": "read",
              "symbolId": "input_pair",
              "tex": "z",
              "architectureRef": "value_sites.pair_state_input",
              "occurrences": [
                {
                  "start": 38,
                  "end": 39
                }
              ]
            },
            {
              "lexeme": "token_mask",
              "access": "read",
              "symbolId": "input_token_mask",
              "architectureRef": "value_sites.token_mask_input",
              "occurrences": [
                {
                  "start": 41,
                  "end": 51
                }
              ]
            },
            {
              "lexeme": "pair_mask",
              "access": "read",
              "symbolId": "input_pair_mask",
              "architectureRef": "value_sites.pair_mask_input",
              "occurrences": [
                {
                  "start": 53,
                  "end": 62
                }
              ]
            }
          ]
        },
        {
          "id": "initialize_pair_state",
          "text": "z_i = z",
          "refs": "pairformer_stack input",
          "sourceRefs": [
            {
              "source": "evoformer_code",
              "locator": "pairformer_stack input"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "relations.input_pair_state_initializes_block_pair_state",
          "architectureRefs": [
            "relations.input_pair_state_initializes_block_pair_state"
          ],
          "operation": "initialize_pair_state",
          "inputs": [
            "stack_pair_input"
          ],
          "outputs": [
            "block_pair"
          ],
          "codeBindings": [
            {
              "lexeme": "z_i",
              "access": "write",
              "symbolId": "block_pair",
              "tex": "z_i",
              "architectureRef": "value_sites.block_pair_state",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "z",
              "access": "read",
              "symbolId": "stack_pair_input",
              "tex": "z",
              "architectureRef": "value_sites.pair_state_input",
              "occurrences": [
                {
                  "start": 6,
                  "end": 7
                }
              ]
            }
          ]
        },
        {
          "id": "initialize_single_state",
          "text": "s_i = s",
          "refs": "pairformer_stack input",
          "sourceRefs": [
            {
              "source": "evoformer_code",
              "locator": "pairformer_stack input"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "relations.input_single_state_initializes_block_single_state",
          "architectureRefs": [
            "relations.input_single_state_initializes_block_single_state"
          ],
          "operation": "initialize_single_state",
          "inputs": [
            "stack_single_input"
          ],
          "outputs": [
            "block_single"
          ],
          "codeBindings": [
            {
              "lexeme": "s_i",
              "access": "write",
              "symbolId": "block_single",
              "tex": "s_i",
              "architectureRef": "value_sites.block_single_state",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "s",
              "access": "read",
              "symbolId": "stack_single_input",
              "tex": "s",
              "architectureRef": "value_sites.single_state_input",
              "occurrences": [
                {
                  "start": 6,
                  "end": 7
                }
              ]
            }
          ]
        },
        {
          "id": "run_pair_update",
          "text": "z_next = PairUpdate(z_i, pair_mask)",
          "comment": "All five pair residual updates complete before the single track reads z_next.",
          "refs": "PairFormerIteration.__call__ pair updates",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration.__call__ pair updates"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "modules.pair_update_stage",
          "calleeScopeRef": "scopes.pair_update",
          "architectureRefs": [
            "modules.pair_update_stage",
            "claims.pair_track_precedes_single_track"
          ],
          "operation": "update_pair_track",
          "inputs": [
            "block_pair",
            "stack_pair_mask"
          ],
          "outputs": [
            "updated_pair"
          ],
          "codeBindings": [
            {
              "lexeme": "z_next",
              "access": "write",
              "symbolId": "updated_pair",
              "tex": "z_{i+1}",
              "architectureRef": "value_sites.pair_after_transition",
              "occurrences": [
                {
                  "start": 0,
                  "end": 6
                }
              ]
            },
            {
              "lexeme": "PairUpdate",
              "access": "call",
              "architectureRef": "modules.pair_update_stage",
              "occurrences": [
                {
                  "start": 9,
                  "end": 19
                }
              ]
            },
            {
              "lexeme": "z_i",
              "access": "read",
              "symbolId": "block_pair",
              "tex": "z_i",
              "architectureRef": "value_sites.block_pair_state",
              "occurrences": [
                {
                  "start": 20,
                  "end": 23
                }
              ]
            },
            {
              "lexeme": "pair_mask",
              "access": "read",
              "symbolId": "stack_pair_mask",
              "architectureRef": "value_sites.pair_mask_input",
              "occurrences": [
                {
                  "start": 25,
                  "end": 34
                }
              ]
            }
          ]
        },
        {
          "id": "run_single_update",
          "text": "s_next = SingleUpdate(s_i, z_next, token_mask)",
          "refs": "PairFormerIteration.__call__ single updates",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration.__call__ single updates"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "modules.single_update_stage",
          "calleeScopeRef": "scopes.single_update",
          "architectureRefs": [
            "modules.single_update_stage",
            "claims.pair_state_does_not_receive_single_update"
          ],
          "operation": "update_single_track",
          "inputs": [
            "block_single",
            "updated_pair",
            "stack_token_mask"
          ],
          "outputs": [
            "updated_single"
          ],
          "codeBindings": [
            {
              "lexeme": "s_next",
              "access": "write",
              "symbolId": "updated_single",
              "tex": "s_{i+1}",
              "architectureRef": "value_sites.single_after_transition",
              "occurrences": [
                {
                  "start": 0,
                  "end": 6
                }
              ]
            },
            {
              "lexeme": "SingleUpdate",
              "access": "call",
              "architectureRef": "modules.single_update_stage",
              "occurrences": [
                {
                  "start": 9,
                  "end": 21
                }
              ]
            },
            {
              "lexeme": "s_i",
              "access": "read",
              "symbolId": "block_single",
              "tex": "s_i",
              "architectureRef": "value_sites.block_single_state",
              "occurrences": [
                {
                  "start": 22,
                  "end": 25
                }
              ]
            },
            {
              "lexeme": "z_next",
              "access": "read",
              "symbolId": "updated_pair",
              "tex": "z_{i+1}",
              "architectureRef": "value_sites.pair_after_transition",
              "occurrences": [
                {
                  "start": 27,
                  "end": 33
                }
              ]
            },
            {
              "lexeme": "token_mask",
              "access": "read",
              "symbolId": "stack_token_mask",
              "architectureRef": "value_sites.token_mask_input",
              "occurrences": [
                {
                  "start": 35,
                  "end": 45
                }
              ]
            }
          ]
        },
        {
          "id": "carry_pair_state",
          "text": "z_i = z_next",
          "refs": "hk.experimental.layer_stack",
          "sourceRefs": [
            {
              "source": "evoformer_code",
              "locator": "hk.experimental.layer_stack"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "relations.block_pair_output_reenters_next_pairformer_block",
          "architectureRefs": [
            "relations.block_pair_output_reenters_next_pairformer_block",
            "execution.loops.pairformer_stack"
          ],
          "operation": "advance_pair_block_state",
          "inputs": [
            "updated_pair"
          ],
          "outputs": [
            "block_pair"
          ],
          "codeBindings": [
            {
              "lexeme": "z_i",
              "access": "write",
              "symbolId": "block_pair",
              "tex": "z_i",
              "architectureRef": "value_sites.block_pair_state",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "z_next",
              "access": "read",
              "symbolId": "updated_pair",
              "tex": "z_{i+1}",
              "architectureRef": "value_sites.pair_after_transition",
              "occurrences": [
                {
                  "start": 6,
                  "end": 12
                }
              ]
            }
          ]
        },
        {
          "id": "carry_single_state",
          "text": "s_i = s_next",
          "refs": "hk.experimental.layer_stack",
          "sourceRefs": [
            {
              "source": "evoformer_code",
              "locator": "hk.experimental.layer_stack"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "relations.block_single_output_reenters_next_pairformer_block",
          "architectureRefs": [
            "relations.block_single_output_reenters_next_pairformer_block",
            "execution.loops.pairformer_stack"
          ],
          "operation": "advance_single_block_state",
          "inputs": [
            "updated_single"
          ],
          "outputs": [
            "block_single"
          ],
          "codeBindings": [
            {
              "lexeme": "s_i",
              "access": "write",
              "symbolId": "block_single",
              "tex": "s_i",
              "architectureRef": "value_sites.block_single_state",
              "occurrences": [
                {
                  "start": 0,
                  "end": 3
                }
              ]
            },
            {
              "lexeme": "s_next",
              "access": "read",
              "symbolId": "updated_single",
              "tex": "s_{i+1}",
              "architectureRef": "value_sites.single_after_transition",
              "occurrences": [
                {
                  "start": 6,
                  "end": 12
                }
              ]
            }
          ]
        },
        {
          "id": "expose_pair_output",
          "text": "z_trunk = z_next",
          "refs": "pair_activations output",
          "sourceRefs": [
            {
              "source": "evoformer_code",
              "locator": "pair_activations output"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "relations.final_pair_block_state_becomes_output",
          "architectureRefs": [
            "relations.final_pair_block_state_becomes_output"
          ],
          "operation": "expose_final_pair_state",
          "inputs": [
            "updated_pair"
          ],
          "outputs": [
            "stack_output_pair"
          ],
          "codeBindings": [
            {
              "lexeme": "z_trunk",
              "access": "write",
              "symbolId": "stack_output_pair",
              "tex": "z^{trunk}",
              "architectureRef": "value_sites.pair_state_output",
              "occurrences": [
                {
                  "start": 0,
                  "end": 7
                }
              ]
            },
            {
              "lexeme": "z_next",
              "access": "read",
              "symbolId": "updated_pair",
              "tex": "z_{i+1}",
              "architectureRef": "value_sites.pair_after_transition",
              "occurrences": [
                {
                  "start": 10,
                  "end": 16
                }
              ]
            }
          ]
        },
        {
          "id": "expose_single_output",
          "text": "s_trunk = s_next",
          "refs": "single_activations output",
          "sourceRefs": [
            {
              "source": "evoformer_code",
              "locator": "single_activations output"
            }
          ],
          "scopeRef": "scopes.stack",
          "statementRef": "relations.final_single_block_state_becomes_output",
          "architectureRefs": [
            "relations.final_single_block_state_becomes_output"
          ],
          "operation": "expose_final_single_state",
          "inputs": [
            "updated_single"
          ],
          "outputs": [
            "stack_output_single"
          ],
          "codeBindings": [
            {
              "lexeme": "s_trunk",
              "access": "write",
              "symbolId": "stack_output_single",
              "tex": "s^{trunk}",
              "architectureRef": "value_sites.single_state_output",
              "occurrences": [
                {
                  "start": 0,
                  "end": 7
                }
              ]
            },
            {
              "lexeme": "s_next",
              "access": "read",
              "symbolId": "updated_single",
              "tex": "s_{i+1}",
              "architectureRef": "value_sites.single_after_transition",
              "occurrences": [
                {
                  "start": 10,
                  "end": 16
                }
              ]
            }
          ]
        },
        {
          "id": "outgoing_triangle_update",
          "text": "z_out = z_i + TriangleMultiplicationOutgoing(z_i, pair_mask)",
          "refs": "PairFormerIteration triangle_multiplication_outgoing",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration triangle_multiplication_outgoing"
            }
          ],
          "scopeRef": "scopes.pair_update",
          "statementRef": "modules.triangle_multiplication_outgoing",
          "architectureRefs": [
            "modules.triangle_multiplication_outgoing"
          ],
          "operation": "residual_outgoing_triangle_multiplication",
          "inputs": [
            "pair_input",
            "pair_scope_mask"
          ],
          "outputs": [
            "pair_outgoing"
          ],
          "codeBindings": [
            {
              "lexeme": "z_out",
              "access": "write",
              "symbolId": "pair_outgoing",
              "tex": "z^{out}",
              "architectureRef": "value_sites.pair_after_outgoing_multiplication",
              "occurrences": [
                {
                  "start": 0,
                  "end": 5
                }
              ]
            },
            {
              "lexeme": "z_i",
              "access": "read",
              "symbolId": "pair_input",
              "tex": "z_i",
              "architectureRef": "value_sites.block_pair_state",
              "occurrences": [
                {
                  "start": 8,
                  "end": 11
                },
                {
                  "start": 45,
                  "end": 48
                }
              ]
            },
            {
              "lexeme": "TriangleMultiplicationOutgoing",
              "access": "call",
              "architectureRef": "modules.triangle_multiplication_outgoing",
              "occurrences": [
                {
                  "start": 14,
                  "end": 44
                }
              ]
            },
            {
              "lexeme": "pair_mask",
              "access": "read",
              "symbolId": "pair_scope_mask",
              "architectureRef": "value_sites.pair_mask_input",
              "occurrences": [
                {
                  "start": 50,
                  "end": 59
                }
              ]
            }
          ]
        },
        {
          "id": "incoming_triangle_update",
          "text": "z_in = z_out + TriangleMultiplicationIncoming(z_out, pair_mask)",
          "refs": "PairFormerIteration triangle_multiplication_incoming",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration triangle_multiplication_incoming"
            }
          ],
          "scopeRef": "scopes.pair_update",
          "statementRef": "modules.triangle_multiplication_incoming",
          "architectureRefs": [
            "modules.triangle_multiplication_incoming"
          ],
          "operation": "residual_incoming_triangle_multiplication",
          "inputs": [
            "pair_outgoing",
            "pair_scope_mask"
          ],
          "outputs": [
            "pair_incoming"
          ],
          "codeBindings": [
            {
              "lexeme": "z_in",
              "access": "write",
              "symbolId": "pair_incoming",
              "tex": "z^{in}",
              "architectureRef": "value_sites.pair_after_incoming_multiplication",
              "occurrences": [
                {
                  "start": 0,
                  "end": 4
                }
              ]
            },
            {
              "lexeme": "z_out",
              "access": "read",
              "symbolId": "pair_outgoing",
              "tex": "z^{out}",
              "architectureRef": "value_sites.pair_after_outgoing_multiplication",
              "occurrences": [
                {
                  "start": 7,
                  "end": 12
                },
                {
                  "start": 46,
                  "end": 51
                }
              ]
            },
            {
              "lexeme": "TriangleMultiplicationIncoming",
              "access": "call",
              "architectureRef": "modules.triangle_multiplication_incoming",
              "occurrences": [
                {
                  "start": 15,
                  "end": 45
                }
              ]
            },
            {
              "lexeme": "pair_mask",
              "access": "read",
              "symbolId": "pair_scope_mask",
              "architectureRef": "value_sites.pair_mask_input",
              "occurrences": [
                {
                  "start": 53,
                  "end": 62
                }
              ]
            }
          ]
        },
        {
          "id": "starting_node_attention_update",
          "text": "z_start = z_in + TriangleAttentionStartingNode(z_in, pair_mask)",
          "refs": "PairFormerIteration pair_attention1 transpose=False",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration pair_attention1 transpose=False"
            }
          ],
          "scopeRef": "scopes.pair_update",
          "statementRef": "modules.pair_attention_starting_node",
          "architectureRefs": [
            "modules.pair_attention_starting_node"
          ],
          "operation": "residual_starting_node_attention",
          "inputs": [
            "pair_incoming",
            "pair_scope_mask"
          ],
          "outputs": [
            "pair_starting"
          ],
          "codeBindings": [
            {
              "lexeme": "z_start",
              "access": "write",
              "symbolId": "pair_starting",
              "tex": "z^{start}",
              "architectureRef": "value_sites.pair_after_starting_attention",
              "occurrences": [
                {
                  "start": 0,
                  "end": 7
                }
              ]
            },
            {
              "lexeme": "z_in",
              "access": "read",
              "symbolId": "pair_incoming",
              "tex": "z^{in}",
              "architectureRef": "value_sites.pair_after_incoming_multiplication",
              "occurrences": [
                {
                  "start": 10,
                  "end": 14
                },
                {
                  "start": 47,
                  "end": 51
                }
              ]
            },
            {
              "lexeme": "TriangleAttentionStartingNode",
              "access": "call",
              "architectureRef": "modules.pair_attention_starting_node",
              "occurrences": [
                {
                  "start": 17,
                  "end": 46
                }
              ]
            },
            {
              "lexeme": "pair_mask",
              "access": "read",
              "symbolId": "pair_scope_mask",
              "architectureRef": "value_sites.pair_mask_input",
              "occurrences": [
                {
                  "start": 53,
                  "end": 62
                }
              ]
            }
          ]
        },
        {
          "id": "ending_node_attention_update",
          "text": "z_end = z_start + TriangleAttentionEndingNode(z_start, pair_mask)",
          "refs": "PairFormerIteration pair_attention2 transpose=True",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration pair_attention2 transpose=True"
            }
          ],
          "scopeRef": "scopes.pair_update",
          "statementRef": "modules.pair_attention_ending_node",
          "architectureRefs": [
            "modules.pair_attention_ending_node"
          ],
          "operation": "residual_ending_node_attention",
          "inputs": [
            "pair_starting",
            "pair_scope_mask"
          ],
          "outputs": [
            "pair_ending"
          ],
          "codeBindings": [
            {
              "lexeme": "z_end",
              "access": "write",
              "symbolId": "pair_ending",
              "tex": "z^{end}",
              "architectureRef": "value_sites.pair_after_ending_attention",
              "occurrences": [
                {
                  "start": 0,
                  "end": 5
                }
              ]
            },
            {
              "lexeme": "z_start",
              "access": "read",
              "symbolId": "pair_starting",
              "tex": "z^{start}",
              "architectureRef": "value_sites.pair_after_starting_attention",
              "occurrences": [
                {
                  "start": 8,
                  "end": 15
                },
                {
                  "start": 46,
                  "end": 53
                }
              ]
            },
            {
              "lexeme": "TriangleAttentionEndingNode",
              "access": "call",
              "architectureRef": "modules.pair_attention_ending_node",
              "occurrences": [
                {
                  "start": 18,
                  "end": 45
                }
              ]
            },
            {
              "lexeme": "pair_mask",
              "access": "read",
              "symbolId": "pair_scope_mask",
              "architectureRef": "value_sites.pair_mask_input",
              "occurrences": [
                {
                  "start": 55,
                  "end": 64
                }
              ]
            }
          ]
        },
        {
          "id": "pair_transition_update",
          "text": "z_next = z_end + PairTransition(z_end)",
          "refs": "PairFormerIteration pair_transition and TransitionBlock",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration pair_transition and TransitionBlock"
            }
          ],
          "scopeRef": "scopes.pair_update",
          "statementRef": "modules.pair_transition",
          "architectureRefs": [
            "modules.pair_transition"
          ],
          "operation": "residual_pair_transition",
          "inputs": [
            "pair_ending"
          ],
          "outputs": [
            "pair_output"
          ],
          "codeBindings": [
            {
              "lexeme": "z_next",
              "access": "write",
              "symbolId": "pair_output",
              "tex": "z_{i+1}",
              "architectureRef": "value_sites.pair_after_transition",
              "occurrences": [
                {
                  "start": 0,
                  "end": 6
                }
              ]
            },
            {
              "lexeme": "z_end",
              "access": "read",
              "symbolId": "pair_ending",
              "tex": "z^{end}",
              "architectureRef": "value_sites.pair_after_ending_attention",
              "occurrences": [
                {
                  "start": 9,
                  "end": 14
                },
                {
                  "start": 32,
                  "end": 37
                }
              ]
            },
            {
              "lexeme": "PairTransition",
              "access": "call",
              "architectureRef": "modules.pair_transition",
              "occurrences": [
                {
                  "start": 17,
                  "end": 31
                }
              ]
            }
          ]
        },
        {
          "id": "project_pair_logits",
          "text": "pair_logits = Linear16(LayerNorm(z_next))",
          "refs": "single_pair_logits_norm and single_pair_logits_projection",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "single_pair_logits_norm and single_pair_logits_projection"
            }
          ],
          "scopeRef": "scopes.single_update",
          "statementRef": "modules.single_pair_logits_projection",
          "architectureRefs": [
            "modules.single_pair_logits_projection"
          ],
          "operation": "project_pair_attention_logits",
          "inputs": [
            "single_pair_input"
          ],
          "outputs": [
            "pair_logits"
          ],
          "codeBindings": [
            {
              "lexeme": "pair_logits",
              "access": "write",
              "symbolId": "pair_logits",
              "architectureRef": "value_sites.single_pair_attention_logits",
              "occurrences": [
                {
                  "start": 0,
                  "end": 11
                }
              ]
            },
            {
              "lexeme": "Linear16",
              "access": "call",
              "architectureRef": "modules.single_pair_logits_projection",
              "occurrences": [
                {
                  "start": 14,
                  "end": 22
                }
              ]
            },
            {
              "lexeme": "z_next",
              "access": "read",
              "symbolId": "single_pair_input",
              "tex": "z_{i+1}",
              "architectureRef": "value_sites.pair_after_transition",
              "occurrences": [
                {
                  "start": 33,
                  "end": 39
                }
              ]
            }
          ]
        },
        {
          "id": "pair_biased_single_attention_update",
          "text": "s_attn = s_i + SingleAttention(s_i, token_mask, pair_logits)",
          "refs": "PairFormerIteration single_attention_ call, self_attention",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration single_attention_ call"
            },
            {
              "source": "single_attention_code",
              "locator": "self_attention"
            }
          ],
          "scopeRef": "scopes.single_update",
          "statementRef": "modules.single_attention_with_pair_bias",
          "architectureRefs": [
            "modules.single_attention_with_pair_bias",
            "relations.pair_logits_bias_single_attention"
          ],
          "operation": "residual_pair_biased_single_attention",
          "inputs": [
            "single_input",
            "single_scope_mask",
            "pair_logits"
          ],
          "outputs": [
            "single_attention_state"
          ],
          "codeBindings": [
            {
              "lexeme": "s_attn",
              "access": "write",
              "symbolId": "single_attention_state",
              "tex": "s^{attn}",
              "architectureRef": "value_sites.single_after_pair_attention",
              "occurrences": [
                {
                  "start": 0,
                  "end": 6
                }
              ]
            },
            {
              "lexeme": "s_i",
              "access": "read",
              "symbolId": "single_input",
              "tex": "s_i",
              "architectureRef": "value_sites.block_single_state",
              "occurrences": [
                {
                  "start": 9,
                  "end": 12
                },
                {
                  "start": 31,
                  "end": 34
                }
              ]
            },
            {
              "lexeme": "SingleAttention",
              "access": "call",
              "architectureRef": "modules.single_attention_with_pair_bias",
              "occurrences": [
                {
                  "start": 15,
                  "end": 30
                }
              ]
            },
            {
              "lexeme": "token_mask",
              "access": "read",
              "symbolId": "single_scope_mask",
              "architectureRef": "value_sites.token_mask_input",
              "occurrences": [
                {
                  "start": 36,
                  "end": 46
                }
              ]
            },
            {
              "lexeme": "pair_logits",
              "access": "read",
              "symbolId": "pair_logits",
              "architectureRef": "value_sites.single_pair_attention_logits",
              "occurrences": [
                {
                  "start": 48,
                  "end": 59
                }
              ]
            }
          ]
        },
        {
          "id": "single_transition_update",
          "text": "s_next = s_attn + SingleTransition(s_attn)",
          "refs": "PairFormerIteration single_transition and TransitionBlock",
          "sourceRefs": [
            {
              "source": "pairformer_code",
              "locator": "PairFormerIteration single_transition and TransitionBlock"
            }
          ],
          "scopeRef": "scopes.single_update",
          "statementRef": "modules.single_transition",
          "architectureRefs": [
            "modules.single_transition"
          ],
          "operation": "residual_single_transition",
          "inputs": [
            "single_attention_state"
          ],
          "outputs": [
            "single_output"
          ],
          "codeBindings": [
            {
              "lexeme": "s_next",
              "access": "write",
              "symbolId": "single_output",
              "tex": "s_{i+1}",
              "architectureRef": "value_sites.single_after_transition",
              "occurrences": [
                {
                  "start": 0,
                  "end": 6
                }
              ]
            },
            {
              "lexeme": "s_attn",
              "access": "read",
              "symbolId": "single_attention_state",
              "tex": "s^{attn}",
              "architectureRef": "value_sites.single_after_pair_attention",
              "occurrences": [
                {
                  "start": 9,
                  "end": 15
                },
                {
                  "start": 35,
                  "end": 41
                }
              ]
            },
            {
              "lexeme": "SingleTransition",
              "access": "call",
              "architectureRef": "modules.single_transition",
              "occurrences": [
                {
                  "start": 18,
                  "end": 34
                }
              ]
            }
          ]
        }
      ],
      "claims": [
        {
          "id": "pair_updates_are_sequential",
          "statement": "Every pair residual update reads the state produced by the immediately preceding pair operation.",
          "line_refs": [
            "outgoing_triangle_update",
            "incoming_triangle_update",
            "starting_node_attention_update",
            "ending_node_attention_update",
            "pair_transition_update"
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "af3_pairformer_code",
                "role": "implementation_evidence",
                "locator": "PairFormerIteration.__call__"
              }
            ]
          }
        },
        {
          "id": "pair_to_single_path_is_logit_bias",
          "statement": "Pair state affects the single update through additive per-head attention logits rather than through concatenation with the single values.",
          "line_refs": [
            "project_pair_logits",
            "pair_biased_single_attention_update"
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "source_ref": "af3_pairformer_code",
                "role": "implementation_evidence",
                "locator": "single_pair_logits_projection"
              },
              {
                "source_ref": "af3_self_attention_code",
                "role": "implementation_evidence",
                "locator": "self_attention logits += pair_logits"
              }
            ]
          }
        }
      ],
      "sourceYaml": "../../pseudocode/alphafold3-pairformer.yaml"
    }
  },
  "boards": {
    "schemaVersion": "visualization-v0.4",
    "sourceYaml": "../../views/alphafold3-pairformer-semantic-zoom.view.yaml",
    "rootBoard": "pairformer_overview",
    "items": [
      {
        "id": "pairformer_overview",
        "title": "AlphaFold 3 Pairformer",
        "summary": "The AF3 trunk hands the Pairformer a token-wise single representation and an ordered token-pair representation. Forty-eight independently parameterized blocks refine both tracks, then return them to downstream AF3 modules.",
        "subject_ref": "architecture",
        "expansion_depth": 1,
        "grid": {
          "columns": 5,
          "rows": 5,
          "column_sizing": "content",
          "col_gap": 40,
          "row_gap": 32
        },
        "nodes": [
          {
            "id": "token_mask_input",
            "ref": "value_sites.token_mask_input",
            "label": "token mask",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 1
          },
          {
            "id": "single_state_input",
            "ref": "value_sites.single_state_input",
            "label": "input singles",
            "notation": "s",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 2
          },
          {
            "id": "pair_state_input",
            "ref": "value_sites.pair_state_input",
            "label": "input pairs",
            "notation": "z",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 4
          },
          {
            "id": "pair_mask_input",
            "ref": "value_sites.pair_mask_input",
            "label": "pair mask",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 5
          },
          {
            "id": "pairformer_stack",
            "ref": "modules.pairformer_stack",
            "label": "48-block Pairformer",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 3,
            "board_ref": "pairformer_block"
          },
          {
            "id": "single_state_output",
            "ref": "value_sites.single_state_output",
            "label": "trunk singles",
            "notation": "s^{trunk}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 2
          },
          {
            "id": "pair_state_output",
            "ref": "value_sites.pair_state_output",
            "label": "trunk pairs",
            "notation": "z^{trunk}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 4
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.final_single_block_state_becomes_output"
            },
            "label": "s^{trunk}",
            "connection": {
              "title": "Final single representation",
              "role": "downstream trunk state",
              "inside": "After block 48, the token-wise state is exposed to downstream AF3 modules."
            }
          },
          {
            "match": {
              "relation_ref": "relations.final_pair_block_state_becomes_output"
            },
            "label": "z^{trunk}",
            "connection": {
              "title": "Final pair representation",
              "role": "downstream pair context",
              "inside": "After block 48, the ordered token-pair state is exposed to downstream AF3 modules."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_7d57332cdd97",
            "from": "pair_mask_input",
            "to": "pairformer_stack",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_ending_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_ending_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_f24e2d2d57f1",
            "from": "pair_mask_input",
            "to": "pairformer_stack",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_incoming_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_incoming_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_42be7a59d897",
            "from": "pair_mask_input",
            "to": "pairformer_stack",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_outgoing_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_outgoing_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_fe4f7af85d32",
            "from": "pair_mask_input",
            "to": "pairformer_stack",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_starting_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_starting_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_ebfe5c7e75c5",
            "from": "pair_state_input",
            "to": "pairformer_stack",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.input_pair_state_initializes_block_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_pair_state_initializes_block_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_97d1e9fd492c",
            "from": "pairformer_stack",
            "to": "pair_state_output",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.final_pair_block_state_becomes_output"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.final_pair_block_state_becomes_output"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "z^{trunk}",
              "connection": {
                "title": "Final pair representation",
                "role": "downstream pair context",
                "inside": "After block 48, the ordered token-pair state is exposed to downstream AF3 modules."
              }
            }
          },
          {
            "id": "projection_3db1d176a533",
            "from": "pairformer_stack",
            "to": "single_state_output",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.final_single_block_state_becomes_output"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.final_single_block_state_becomes_output"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
              "label": "s^{trunk}",
              "connection": {
                "title": "Final single representation",
                "role": "downstream trunk state",
                "inside": "After block 48, the token-wise state is exposed to downstream AF3 modules."
              }
            }
          },
          {
            "id": "projection_f1044b987a6f",
            "from": "single_state_input",
            "to": "pairformer_stack",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.input_single_state_initializes_block_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_single_state_initializes_block_single_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_d3b940b30ce4",
            "from": "token_mask_input",
            "to": "pairformer_stack",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.token_mask_conditions_single_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.token_mask_conditions_single_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_mask"
            ],
            "presentation": {
            }
          }
        ],
        "classifications": {
          "modules.pair_attention_ending_node": "collapsed:modules.pairformer_stack",
          "modules.pair_attention_starting_node": "collapsed:modules.pairformer_stack",
          "modules.pair_transition": "collapsed:modules.pairformer_stack",
          "modules.pairformer_stack": "visible",
          "modules.single_attention_with_pair_bias": "collapsed:modules.pairformer_stack",
          "modules.single_pair_logits_projection": "collapsed:modules.pairformer_stack",
          "modules.single_transition": "collapsed:modules.pairformer_stack",
          "modules.triangle_multiplication_incoming": "collapsed:modules.pairformer_stack",
          "modules.triangle_multiplication_outgoing": "collapsed:modules.pairformer_stack",
          "value_sites.block_pair_state": "collapsed:modules.pairformer_stack",
          "value_sites.block_single_state": "collapsed:modules.pairformer_stack",
          "value_sites.pair_after_ending_attention": "collapsed:modules.pairformer_stack",
          "value_sites.pair_after_incoming_multiplication": "collapsed:modules.pairformer_stack",
          "value_sites.pair_after_outgoing_multiplication": "collapsed:modules.pairformer_stack",
          "value_sites.pair_after_starting_attention": "collapsed:modules.pairformer_stack",
          "value_sites.pair_after_transition": "collapsed:modules.pairformer_stack",
          "value_sites.pair_mask_input": "visible",
          "value_sites.pair_state_input": "visible",
          "value_sites.pair_state_output": "visible",
          "value_sites.single_after_pair_attention": "collapsed:modules.pairformer_stack",
          "value_sites.single_after_transition": "collapsed:modules.pairformer_stack",
          "value_sites.single_pair_attention_logits": "collapsed:modules.pairformer_stack",
          "value_sites.single_state_input": "visible",
          "value_sites.single_state_output": "visible",
          "value_sites.token_mask_input": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "pairformer_block",
        "title": "One Pairformer Block, Repeated 48 Times",
        "summary": "Each block first completes the pair-track update. Only then is that updated pair state projected to attention logits that bias the single-track update. The two outputs become the next block's inputs.",
        "parent": "pairformer_overview",
        "subject_ref": "modules.pairformer_stack",
        "expansion_depth": 1,
        "grid": {
          "columns": 9,
          "rows": 5,
          "column_sizing": "content",
          "col_gap": 32,
          "row_gap": 30
        },
        "regions": [
          {
            "id": "pairformer_block_iteration",
            "kind": "repeat",
            "execution_ref": "execution.loops.pairformer_stack",
            "label": "one Pairformer block",
            "node_ids": [
              "block_single_state",
              "block_pair_state",
              "pair_update_stage",
              "pair_after_transition",
              "single_update_stage",
              "single_after_transition"
            ],
            "iteration_relation_refs": [
              "relations.block_pair_output_reenters_next_pairformer_block",
              "relations.block_single_output_reenters_next_pairformer_block"
            ]
          }
        ],
        "nodes": [
          {
            "id": "single_state_input",
            "ref": "value_sites.single_state_input",
            "label": "initial singles",
            "notation": "s",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 2
          },
          {
            "id": "pair_state_input",
            "ref": "value_sites.pair_state_input",
            "label": "initial pairs",
            "notation": "z",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 4
          },
          {
            "id": "block_single_state",
            "ref": "value_sites.block_single_state",
            "label": "block-input singles",
            "notation": "s_i",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 2
          },
          {
            "id": "block_pair_state",
            "ref": "value_sites.block_pair_state",
            "label": "block-input pairs",
            "notation": "z_i",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 4
          },
          {
            "id": "pair_mask_input",
            "ref": "value_sites.pair_mask_input",
            "label": "pair mask",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 3,
            "row": 5
          },
          {
            "id": "pair_update_stage",
            "ref": "modules.pair_update_stage",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 4,
            "board_ref": "pair_track"
          },
          {
            "id": "pair_after_transition",
            "ref": "value_sites.pair_after_transition",
            "label": "updated pairs",
            "notation": "z_{i+1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 4
          },
          {
            "id": "token_mask_input",
            "ref": "value_sites.token_mask_input",
            "label": "token mask",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 5,
            "row": 1
          },
          {
            "id": "single_update_stage",
            "ref": "modules.single_update_stage",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 2,
            "board_ref": "single_track"
          },
          {
            "id": "single_after_transition",
            "ref": "value_sites.single_after_transition",
            "label": "updated singles",
            "notation": "s_{i+1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 2
          },
          {
            "id": "single_state_output",
            "ref": "value_sites.single_state_output",
            "label": "final singles",
            "notation": "s^{trunk}",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 9,
            "row": 2
          },
          {
            "id": "pair_state_output",
            "ref": "value_sites.pair_state_output",
            "label": "final pairs",
            "notation": "z^{trunk}",
            "prominence": "context",
            "treatment": "compact",
            "density": "compact",
            "col": 9,
            "row": 4
          }
        ],
        "exclude": [
          {
            "ref": "value_sites.single_pair_attention_logits",
            "reason": "The parent block board keeps the single update atomic; its pair-logit intermediate is expanded on the Single Track child board."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.input_pair_state_initializes_block_pair_state"
            },
            "label": "initialize z",
            "connection": {
              "title": "Initialize pair rail",
              "role": "first-block pair state",
              "inside": "The incoming trunk pair representation becomes z_i for the first Pairformer block."
            }
          },
          {
            "match": {
              "relation_ref": "relations.input_single_state_initializes_block_single_state"
            },
            "label": "initialize s",
            "connection": {
              "title": "Initialize single rail",
              "role": "first-block single state",
              "inside": "The incoming trunk single representation becomes s_i for the first Pairformer block."
            }
          },
          {
            "match": {
              "relation_ref": "relations.block_pair_state_enters_outgoing_multiplication"
            },
            "label": "z_i",
            "connection": {
              "title": "Pair track enters its five updates",
              "role": "pair reasoning",
              "inside": "The pair update stage applies the two triangle multiplications, two axial attentions, and pair transition in sequence."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_transition_updates_pair_state"
            },
            "label": "five residual updates",
            "connection": {
              "title": "Completed pair track",
              "role": "updated pair state",
              "inside": "The stage emits z_(i+1) only after all five pair residual updates have completed."
            }
          },
          {
            "match": {
              "relation_ref": "relations.updated_pair_state_enters_bias_projection"
            },
            "label": "pair-derived bias",
            "tone": "conditioning",
            "connection": {
              "title": "Updated pairs condition singles",
              "role": "attention-logit bias source",
              "inside": "The updated pair state is normalized and projected to 16 additive logits per ordered token pair inside the single update stage."
            }
          },
          {
            "match": {
              "relation_ref": "relations.block_single_state_enters_pair_biased_attention"
            },
            "label": "s_i",
            "connection": {
              "title": "Single track enters attention",
              "role": "token reasoning",
              "inside": "The block-input single state receives full self-attention conditioned by the updated pair representation."
            }
          },
          {
            "match": {
              "relation_ref": "relations.single_transition_updates_single_state"
            },
            "label": "attention + transition",
            "connection": {
              "title": "Completed single track",
              "role": "updated single state",
              "inside": "Pair-biased self-attention and a pointwise SwiGLU transition produce s_(i+1)."
            }
          },
          {
            "match": {
              "relation_ref": "relations.block_pair_output_reenters_next_pairformer_block"
            },
            "label": "next block z",
            "tone": "recurrence",
            "route_side": "bottom",
            "route_clearance": 52,
            "connection": {
              "title": "Pair loop carry",
              "role": "next-block state",
              "inside": "The updated pair representation becomes z_i for the next independently parameterized block."
            }
          },
          {
            "match": {
              "relation_ref": "relations.block_single_output_reenters_next_pairformer_block"
            },
            "label": "next block s",
            "tone": "recurrence",
            "route_side": "top",
            "route_clearance": 52,
            "connection": {
              "title": "Single loop carry",
              "role": "next-block state",
              "inside": "The updated single representation becomes s_i for the next independently parameterized block."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_1cd51115ee4a",
            "from": "block_pair_state",
            "to": "pair_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.block_pair_state_enters_outgoing_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_pair_state_enters_outgoing_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "z_i",
              "connection": {
                "title": "Pair track enters its five updates",
                "role": "pair reasoning",
                "inside": "The pair update stage applies the two triangle multiplications, two axial attentions, and pair transition in sequence."
              }
            }
          },
          {
            "id": "projection_50c473e87b00",
            "from": "block_single_state",
            "to": "single_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.block_single_state_enters_pair_biased_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_single_state_enters_pair_biased_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
              "label": "s_i",
              "connection": {
                "title": "Single track enters attention",
                "role": "token reasoning",
                "inside": "The block-input single state receives full self-attention conditioned by the updated pair representation."
              }
            }
          },
          {
            "id": "projection_4dac168e74b4",
            "from": "pair_after_transition",
            "to": "block_pair_state",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.block_pair_output_reenters_next_pairformer_block"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_pair_output_reenters_next_pairformer_block"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "next block z",
              "tone": "recurrence",
              "route_side": "bottom",
              "route_clearance": 52,
              "connection": {
                "title": "Pair loop carry",
                "role": "next-block state",
                "inside": "The updated pair representation becomes z_i for the next independently parameterized block."
              }
            }
          },
          {
            "id": "projection_203097cdae97",
            "from": "pair_after_transition",
            "to": "pair_state_output",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.final_pair_block_state_becomes_output"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.final_pair_block_state_becomes_output"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_0178261d0909",
            "from": "pair_after_transition",
            "to": "single_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.updated_pair_state_enters_bias_projection"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.updated_pair_state_enters_bias_projection"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "pair-derived bias",
              "tone": "conditioning",
              "connection": {
                "title": "Updated pairs condition singles",
                "role": "attention-logit bias source",
                "inside": "The updated pair state is normalized and projected to 16 additive logits per ordered token pair inside the single update stage."
              }
            }
          },
          {
            "id": "projection_6003fe7b7237",
            "from": "pair_mask_input",
            "to": "pair_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_ending_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_ending_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_5632d5bece0f",
            "from": "pair_mask_input",
            "to": "pair_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_incoming_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_incoming_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_8b70fcfbce9d",
            "from": "pair_mask_input",
            "to": "pair_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_outgoing_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_outgoing_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_453c9a37c45e",
            "from": "pair_mask_input",
            "to": "pair_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_starting_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_starting_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_603e772b1d95",
            "from": "pair_state_input",
            "to": "block_pair_state",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.input_pair_state_initializes_block_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_pair_state_initializes_block_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "initialize z",
              "connection": {
                "title": "Initialize pair rail",
                "role": "first-block pair state",
                "inside": "The incoming trunk pair representation becomes z_i for the first Pairformer block."
              }
            }
          },
          {
            "id": "projection_7b5ca9f4d3d7",
            "from": "pair_update_stage",
            "to": "pair_after_transition",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.pair_transition_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_transition_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "five residual updates",
              "connection": {
                "title": "Completed pair track",
                "role": "updated pair state",
                "inside": "The stage emits z_(i+1) only after all five pair residual updates have completed."
              }
            }
          },
          {
            "id": "projection_08dba3f7ee6e",
            "from": "single_after_transition",
            "to": "block_single_state",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.block_single_output_reenters_next_pairformer_block"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_single_output_reenters_next_pairformer_block"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
              "label": "next block s",
              "tone": "recurrence",
              "route_side": "top",
              "route_clearance": 52,
              "connection": {
                "title": "Single loop carry",
                "role": "next-block state",
                "inside": "The updated single representation becomes s_i for the next independently parameterized block."
              }
            }
          },
          {
            "id": "projection_5177a2f039b1",
            "from": "single_after_transition",
            "to": "single_state_output",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.final_single_block_state_becomes_output"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.final_single_block_state_becomes_output"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_6627248ace90",
            "from": "single_state_input",
            "to": "block_single_state",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.input_single_state_initializes_block_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_single_state_initializes_block_single_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
              "label": "initialize s",
              "connection": {
                "title": "Initialize single rail",
                "role": "first-block single state",
                "inside": "The incoming trunk single representation becomes s_i for the first Pairformer block."
              }
            }
          },
          {
            "id": "projection_46279ec7137b",
            "from": "single_update_stage",
            "to": "single_after_transition",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.single_transition_updates_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_transition_updates_single_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
              "label": "attention + transition",
              "connection": {
                "title": "Completed single track",
                "role": "updated single state",
                "inside": "Pair-biased self-attention and a pointwise SwiGLU transition produce s_(i+1)."
              }
            }
          },
          {
            "id": "projection_05b0fbe7575b",
            "from": "token_mask_input",
            "to": "single_update_stage",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.token_mask_conditions_single_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.token_mask_conditions_single_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_mask"
            ],
            "presentation": {
            }
          }
        ],
        "classifications": {
          "modules.pair_attention_ending_node": "collapsed:modules.pair_update_stage",
          "modules.pair_attention_starting_node": "collapsed:modules.pair_update_stage",
          "modules.pair_transition": "collapsed:modules.pair_update_stage",
          "modules.pair_update_stage": "visible",
          "modules.single_attention_with_pair_bias": "collapsed:modules.single_update_stage",
          "modules.single_pair_logits_projection": "collapsed:modules.single_update_stage",
          "modules.single_transition": "collapsed:modules.single_update_stage",
          "modules.single_update_stage": "visible",
          "modules.triangle_multiplication_incoming": "collapsed:modules.pair_update_stage",
          "modules.triangle_multiplication_outgoing": "collapsed:modules.pair_update_stage",
          "value_sites.block_pair_state": "visible",
          "value_sites.block_single_state": "visible",
          "value_sites.pair_after_ending_attention": "collapsed:modules.pair_update_stage",
          "value_sites.pair_after_incoming_multiplication": "collapsed:modules.pair_update_stage",
          "value_sites.pair_after_outgoing_multiplication": "collapsed:modules.pair_update_stage",
          "value_sites.pair_after_starting_attention": "collapsed:modules.pair_update_stage",
          "value_sites.pair_after_transition": "visible",
          "value_sites.pair_mask_input": "visible",
          "value_sites.pair_state_input": "visible",
          "value_sites.pair_state_output": "visible",
          "value_sites.single_after_pair_attention": "collapsed:modules.single_update_stage",
          "value_sites.single_after_transition": "visible",
          "value_sites.single_pair_attention_logits": "excluded",
          "value_sites.single_state_input": "visible",
          "value_sites.single_state_output": "visible",
          "value_sites.token_mask_input": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "pair_track",
        "title": "Pair Track: Five Ordered Residual Updates",
        "summary": "One 128-channel ordered-pair state passes through outgoing triangle multiplication, incoming triangle multiplication, starting-node attention, ending-node attention, and a 4x SwiGLU transition. Every step adds a delta before the next step reads the state.",
        "parent": "pairformer_block",
        "subject_ref": "modules.pair_update_stage",
        "expansion_depth": 1,
        "grid": {
          "columns": 11,
          "rows": 4,
          "column_sizing": "content",
          "col_gap": 24,
          "row_gap": 28
        },
        "nodes": [
          {
            "id": "pair_mask_input",
            "ref": "value_sites.pair_mask_input",
            "label": "pair mask",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 1
          },
          {
            "id": "block_pair_state",
            "ref": "value_sites.block_pair_state",
            "label": "pair state",
            "notation": "z_i",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 3
          },
          {
            "id": "triangle_multiplication_outgoing",
            "ref": "modules.triangle_multiplication_outgoing",
            "label": "outgoing triangle multiplication + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 3
          },
          {
            "id": "pair_after_outgoing_multiplication",
            "ref": "value_sites.pair_after_outgoing_multiplication",
            "label": "outgoing-updated pairs",
            "notation": "z^{out}",
            "prominence": "context",
            "treatment": "compact",
            "density": "micro",
            "col": 3,
            "row": 3
          },
          {
            "id": "triangle_multiplication_incoming",
            "ref": "modules.triangle_multiplication_incoming",
            "label": "incoming triangle multiplication + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 3
          },
          {
            "id": "pair_after_incoming_multiplication",
            "ref": "value_sites.pair_after_incoming_multiplication",
            "label": "incoming-updated pairs",
            "notation": "z^{in}",
            "prominence": "context",
            "treatment": "compact",
            "density": "micro",
            "col": 5,
            "row": 3
          },
          {
            "id": "pair_attention_starting_node",
            "ref": "modules.pair_attention_starting_node",
            "label": "starting-node attention + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 3
          },
          {
            "id": "pair_after_starting_attention",
            "ref": "value_sites.pair_after_starting_attention",
            "label": "start-attended pairs",
            "notation": "z^{start}",
            "prominence": "context",
            "treatment": "compact",
            "density": "micro",
            "col": 7,
            "row": 3
          },
          {
            "id": "pair_attention_ending_node",
            "ref": "modules.pair_attention_ending_node",
            "label": "ending-node attention + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 8,
            "row": 3
          },
          {
            "id": "pair_after_ending_attention",
            "ref": "value_sites.pair_after_ending_attention",
            "label": "end-attended pairs",
            "notation": "z^{end}",
            "prominence": "context",
            "treatment": "compact",
            "density": "micro",
            "col": 9,
            "row": 3
          },
          {
            "id": "pair_transition",
            "ref": "modules.pair_transition",
            "label": "pair transition + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 10,
            "row": 3
          },
          {
            "id": "pair_after_transition",
            "ref": "value_sites.pair_after_transition",
            "label": "block-output pairs",
            "notation": "z_{i+1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 11,
            "row": 3
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.block_pair_state_enters_outgoing_multiplication"
            },
            "label": "z",
            "connection": {
              "title": "Pair state enters outgoing update",
              "role": "ordered-pair input",
              "inside": "The outgoing triangle operation mixes pairs that share their outgoing endpoint pattern."
            }
          },
          {
            "match": {
              "relation_ref": "relations.outgoing_multiplication_updates_pair_state"
            },
            "label": "+ Δz_out",
            "connection": {
              "title": "Outgoing residual update",
              "role": "pair-state mutation",
              "inside": "The gated outgoing triangle result is projected back to 128 channels and added to the incoming pair state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.incoming_multiplication_updates_pair_state"
            },
            "label": "+ Δz_in",
            "connection": {
              "title": "Incoming residual update",
              "role": "pair-state mutation",
              "inside": "The incoming triangle result is added to the already outgoing-updated pair state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.starting_attention_updates_pair_state"
            },
            "label": "+ Δz_start",
            "connection": {
              "title": "Starting-node attention update",
              "role": "axial pair attention",
              "inside": "Four-head gated attention follows one axis of the pair grid and adds its projected result."
            }
          },
          {
            "match": {
              "relation_ref": "relations.ending_attention_updates_pair_state"
            },
            "label": "+ Δz_end",
            "connection": {
              "title": "Ending-node attention update",
              "role": "complementary axial pair attention",
              "inside": "The implementation transposes the pair grid, applies the same attention anatomy along the other axis, then transposes back."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_transition_updates_pair_state"
            },
            "label": "+ Δz_ffn",
            "connection": {
              "title": "Pair transition update",
              "role": "pointwise pair feed-forward",
              "inside": "LayerNorm and a 4x SwiGLU hidden projection produce a 128-channel delta that is added to each pair entry."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_555ea874e78e",
            "from": "block_pair_state",
            "to": "triangle_multiplication_outgoing",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.block_pair_state_enters_outgoing_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_pair_state_enters_outgoing_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "z",
              "connection": {
                "title": "Pair state enters outgoing update",
                "role": "ordered-pair input",
                "inside": "The outgoing triangle operation mixes pairs that share their outgoing endpoint pattern."
              }
            }
          },
          {
            "id": "projection_7943a55a210e",
            "from": "pair_after_ending_attention",
            "to": "pair_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.ending_pair_state_enters_pair_transition"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.ending_pair_state_enters_pair_transition"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_6fba0c2b8712",
            "from": "pair_after_incoming_multiplication",
            "to": "pair_attention_starting_node",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.incoming_pair_state_enters_starting_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.incoming_pair_state_enters_starting_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_8ae44737cd9e",
            "from": "pair_after_outgoing_multiplication",
            "to": "triangle_multiplication_incoming",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.outgoing_pair_state_enters_incoming_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.outgoing_pair_state_enters_incoming_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_5b23b86c9092",
            "from": "pair_after_starting_attention",
            "to": "pair_attention_ending_node",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.starting_pair_state_enters_ending_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.starting_pair_state_enters_ending_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_9e40a3cacd4f",
            "from": "pair_attention_ending_node",
            "to": "pair_after_ending_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.ending_attention_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.ending_attention_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_end",
              "connection": {
                "title": "Ending-node attention update",
                "role": "complementary axial pair attention",
                "inside": "The implementation transposes the pair grid, applies the same attention anatomy along the other axis, then transposes back."
              }
            }
          },
          {
            "id": "projection_45b746481b2a",
            "from": "pair_attention_starting_node",
            "to": "pair_after_starting_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.starting_attention_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.starting_attention_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_start",
              "connection": {
                "title": "Starting-node attention update",
                "role": "axial pair attention",
                "inside": "Four-head gated attention follows one axis of the pair grid and adds its projected result."
              }
            }
          },
          {
            "id": "projection_b1d6e2c4f860",
            "from": "pair_mask_input",
            "to": "pair_attention_ending_node",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_ending_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_ending_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_336d3a4cf8de",
            "from": "pair_mask_input",
            "to": "pair_attention_starting_node",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_starting_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_starting_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_6078dc05e461",
            "from": "pair_mask_input",
            "to": "triangle_multiplication_incoming",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_incoming_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_incoming_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_3bd720537f77",
            "from": "pair_mask_input",
            "to": "triangle_multiplication_outgoing",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_mask_conditions_outgoing_multiplication"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_mask_conditions_outgoing_multiplication"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_mask"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_a4c16e146db3",
            "from": "pair_transition",
            "to": "pair_after_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.pair_transition_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_transition_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_ffn",
              "connection": {
                "title": "Pair transition update",
                "role": "pointwise pair feed-forward",
                "inside": "LayerNorm and a 4x SwiGLU hidden projection produce a 128-channel delta that is added to each pair entry."
              }
            }
          },
          {
            "id": "projection_3c06742457d1",
            "from": "triangle_multiplication_incoming",
            "to": "pair_after_incoming_multiplication",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.incoming_multiplication_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.incoming_multiplication_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_in",
              "connection": {
                "title": "Incoming residual update",
                "role": "pair-state mutation",
                "inside": "The incoming triangle result is added to the already outgoing-updated pair state."
              }
            }
          },
          {
            "id": "projection_de146f3123a6",
            "from": "triangle_multiplication_outgoing",
            "to": "pair_after_outgoing_multiplication",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.outgoing_multiplication_updates_pair_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.outgoing_multiplication_updates_pair_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "+ Δz_out",
              "connection": {
                "title": "Outgoing residual update",
                "role": "pair-state mutation",
                "inside": "The gated outgoing triangle result is projected back to 128 channels and added to the incoming pair state."
              }
            }
          }
        ],
        "classifications": {
          "modules.pair_attention_ending_node": "visible",
          "modules.pair_attention_starting_node": "visible",
          "modules.pair_transition": "visible",
          "modules.triangle_multiplication_incoming": "visible",
          "modules.triangle_multiplication_outgoing": "visible",
          "value_sites.block_pair_state": "visible",
          "value_sites.pair_after_ending_attention": "visible",
          "value_sites.pair_after_incoming_multiplication": "visible",
          "value_sites.pair_after_outgoing_multiplication": "visible",
          "value_sites.pair_after_starting_attention": "visible",
          "value_sites.pair_after_transition": "visible",
          "value_sites.pair_mask_input": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "single_track",
        "title": "Single Track: Pair-Biased Attention Then Transition",
        "summary": "The completed pair state is normalized and projected to 16 attention-head logits. Those logits bias full self-attention over the 384-channel token states; a second residual update comes from a pointwise 4x SwiGLU transition.",
        "parent": "pairformer_block",
        "subject_ref": "modules.single_update_stage",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 4,
          "column_sizing": "content",
          "col_gap": 30,
          "row_gap": 28
        },
        "nodes": [
          {
            "id": "pair_after_transition",
            "ref": "value_sites.pair_after_transition",
            "label": "updated pairs",
            "notation": "z_{i+1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 1
          },
          {
            "id": "single_pair_logits_projection",
            "ref": "modules.single_pair_logits_projection",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 1
          },
          {
            "id": "single_pair_attention_logits",
            "ref": "value_sites.single_pair_attention_logits",
            "label": "pair attention bias",
            "notation": "b",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 1
          },
          {
            "id": "token_mask_input",
            "ref": "value_sites.token_mask_input",
            "label": "token mask",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 3,
            "row": 2
          },
          {
            "id": "block_single_state",
            "ref": "value_sites.block_single_state",
            "label": "block-input singles",
            "notation": "s_i",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 1,
            "row": 3
          },
          {
            "id": "single_attention_with_pair_bias",
            "ref": "modules.single_attention_with_pair_bias",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 3
          },
          {
            "id": "single_after_pair_attention",
            "ref": "value_sites.single_after_pair_attention",
            "label": "attention-updated singles",
            "notation": "s^{attn}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 3
          },
          {
            "id": "single_transition",
            "ref": "modules.single_transition",
            "label": "single transition + residual",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 6,
            "row": 3
          },
          {
            "id": "single_after_transition",
            "ref": "value_sites.single_after_transition",
            "label": "block-output singles",
            "notation": "s_{i+1}",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 3
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.updated_pair_state_enters_bias_projection"
            },
            "label": "LN(z)",
            "connection": {
              "title": "Normalize updated pairs",
              "role": "bias source",
              "inside": "The pair state is read after all five pair updates and normalized before projection."
            }
          },
          {
            "match": {
              "relation_ref": "relations.bias_projection_produces_pair_logits"
            },
            "label": "Linear 128→16",
            "connection": {
              "title": "Project attention-head logits",
              "role": "pair-to-attention adapter",
              "inside": "Each ordered token pair produces one additive scalar for each of the 16 single-attention heads."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_logits_bias_single_attention"
            },
            "label": "add to logits",
            "tone": "conditioning",
            "connection": {
              "title": "Pair-derived attention bias",
              "role": "pair-to-single information flow",
              "inside": "The projected pair tensor is added to the query-key dot-product logits before softmax; it is not concatenated with single values."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_biased_attention_updates_single_state"
            },
            "label": "+ Δs_attn",
            "connection": {
              "title": "Attention residual update",
              "role": "single-state mutation",
              "inside": "Full 16-head self-attention aggregates token values, applies query gating and an output projection, then the caller adds that delta to s_i."
            }
          },
          {
            "match": {
              "relation_ref": "relations.single_transition_updates_single_state"
            },
            "label": "+ Δs_ffn",
            "connection": {
              "title": "Single transition update",
              "role": "pointwise token feed-forward",
              "inside": "LayerNorm and a 4x SwiGLU hidden projection produce a 384-channel delta that is added to each token state."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_f3a299d2f0b6",
            "from": "block_single_state",
            "to": "single_attention_with_pair_bias",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.block_single_state_enters_pair_biased_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.block_single_state_enters_pair_biased_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_5700ccbaf9eb",
            "from": "pair_after_transition",
            "to": "single_pair_logits_projection",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.updated_pair_state_enters_bias_projection"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.updated_pair_state_enters_bias_projection"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_state"
            ],
            "presentation": {
              "label": "LN(z)",
              "connection": {
                "title": "Normalize updated pairs",
                "role": "bias source",
                "inside": "The pair state is read after all five pair updates and normalized before projection."
              }
            }
          },
          {
            "id": "projection_ca444202e65a",
            "from": "single_after_pair_attention",
            "to": "single_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.attention_updated_single_enters_transition"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.attention_updated_single_enters_transition"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
            }
          },
          {
            "id": "projection_c675c08fcfa2",
            "from": "single_attention_with_pair_bias",
            "to": "single_after_pair_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.pair_biased_attention_updates_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_biased_attention_updates_single_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
              "label": "+ Δs_attn",
              "connection": {
                "title": "Attention residual update",
                "role": "single-state mutation",
                "inside": "Full 16-head self-attention aggregates token values, applies query gating and an output projection, then the caller adds that delta to s_i."
              }
            }
          },
          {
            "id": "projection_c658550ae8d9",
            "from": "single_pair_attention_logits",
            "to": "single_attention_with_pair_bias",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_logits_bias_single_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_logits_bias_single_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_attention_logits"
            ],
            "presentation": {
              "label": "add to logits",
              "tone": "conditioning",
              "connection": {
                "title": "Pair-derived attention bias",
                "role": "pair-to-single information flow",
                "inside": "The projected pair tensor is added to the query-key dot-product logits before softmax; it is not concatenated with single values."
              }
            }
          },
          {
            "id": "projection_4dd989c65d56",
            "from": "single_pair_logits_projection",
            "to": "single_pair_attention_logits",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.bias_projection_produces_pair_logits"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.bias_projection_produces_pair_logits"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_attention_logits"
            ],
            "presentation": {
              "label": "Linear 128→16",
              "connection": {
                "title": "Project attention-head logits",
                "role": "pair-to-attention adapter",
                "inside": "Each ordered token pair produces one additive scalar for each of the 16 single-attention heads."
              }
            }
          },
          {
            "id": "projection_330f649e6cbd",
            "from": "single_transition",
            "to": "single_after_transition",
            "projection": "direct",
            "origin": "canonical",
            "kind": "state_update",
            "relation_path": [
              "relations.single_transition_updates_single_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.single_transition_updates_single_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.single_state"
            ],
            "presentation": {
              "label": "+ Δs_ffn",
              "connection": {
                "title": "Single transition update",
                "role": "pointwise token feed-forward",
                "inside": "LayerNorm and a 4x SwiGLU hidden projection produce a 384-channel delta that is added to each token state."
              }
            }
          },
          {
            "id": "projection_c28bd852fab7",
            "from": "token_mask_input",
            "to": "single_attention_with_pair_bias",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.token_mask_conditions_single_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.token_mask_conditions_single_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.token_mask"
            ],
            "presentation": {
            }
          }
        ],
        "classifications": {
          "modules.single_attention_with_pair_bias": "visible",
          "modules.single_pair_logits_projection": "visible",
          "modules.single_transition": "visible",
          "value_sites.block_single_state": "visible",
          "value_sites.pair_after_transition": "visible",
          "value_sites.single_after_pair_attention": "visible",
          "value_sites.single_after_transition": "visible",
          "value_sites.single_pair_attention_logits": "visible",
          "value_sites.token_mask_input": "visible"
        },
        "projectionMode": "derived"
      }
    ]
  }
};

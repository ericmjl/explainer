export const manifest = {
  "architecture": {
    "id": "generic_feature_refinement",
    "name": "Generic Feature Refinement Pipeline",
    "status": "draft",
    "sourceYaml": "../../architectures/generic-feature-refinement.yaml",
    "modules": [
      {
        "id": "input_adapter",
        "label": "Input Adapter",
        "kind": "feature_adapter",
        "role": "embed raw records and build initial item state, conditioning signal, masks, and grouping indices",
        "scale": "item",
        "inputs": [
          "raw_records"
        ],
        "outputs": [
          "item_state",
          "conditioning_signal",
          "item_to_group_index"
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "id": "context_builder",
        "label": "Context Builder",
        "kind": "pair_context_builder",
        "role": "construct pair/context features used later as attention bias",
        "scale": "item_pair",
        "inputs": [
          "item_state",
          "item_to_group_index"
        ],
        "outputs": [
          "pair_context"
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "id": "item_encoder",
        "label": "Item Encoder",
        "kind": "attention_stack",
        "role": "update fine-scale item state with local attention and per-item conditioning",
        "scale": "item",
        "repeats": 3,
        "pseudocode_ref": "../../pseudocode/generic-feature-refinement.yaml",
        "depth": {
          "blocks": 3,
          "heads": 8
        },
        "contains": [
          {
            "id": "per_item_adaln",
            "label": "Per-item AdaLN",
            "standard_block_ref": "../../standard_blocks/per-item-adaln-conditioning.yaml"
          }
        ],
        "inputs": [
          "item_state",
          "conditioning_signal"
        ],
        "outputs": [
          "item_state"
        ],
        "attention": {
          "pattern": "local",
          "query_scale": "item",
          "key_value_scale": "item",
          "heads": 8,
          "pair_bias": false,
          "pair_bias_source": "none",
          "positional_encoding": {
            "kind": "relative_position"
          }
        },
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "id": "item_to_group_pool",
        "label": "Item-to-Group Pool",
        "kind": "scale_transition",
        "role": "compress item states into group states using an ownership index",
        "scale": "group",
        "inputs": [
          "item_state",
          "item_to_group_index"
        ],
        "outputs": [
          "group_state"
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "id": "group_refiner",
        "label": "Group Refiner",
        "kind": "attention_stack",
        "role": "update compressed group state with full attention and pair/context bias",
        "scale": "group",
        "repeats": 6,
        "pseudocode_ref": "../../pseudocode/generic-feature-refinement.yaml",
        "depth": {
          "blocks": 6,
          "heads": 8
        },
        "contains": [
          {
            "id": "pair_biased_attention",
            "label": "Pair-biased attention",
            "standard_block_ref": "../../standard_blocks/pair-biased-attention.yaml"
          }
        ],
        "inputs": [
          "group_state",
          "pair_context"
        ],
        "outputs": [
          "group_state"
        ],
        "attention": {
          "pattern": "full",
          "query_scale": "group",
          "key_value_scale": "group",
          "heads": 8,
          "pair_bias": true,
          "pair_bias_source": "pair_context",
          "standard_block_ref": "../../standard_blocks/pair-biased-attention.yaml",
          "positional_encoding": {
            "kind": "relative_position"
          }
        },
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "id": "output_decoder",
        "label": "Output Decoder",
        "kind": "decoder",
        "role": "broadcast group output back to item resolution and fuse the item skip state",
        "scale": "item",
        "inputs": [
          "group_state",
          "item_state",
          "item_to_group_index"
        ],
        "outputs": [
          "item_output_state"
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "id": "output_heads",
        "label": "Output Heads",
        "kind": "prediction_heads",
        "role": "project decoded item state to task-specific predictions",
        "scale": "output",
        "inputs": [
          "item_output_state"
        ],
        "outputs": [
          "predictions"
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      }
    ],
    "representations": [
      {
        "id": "raw_records",
        "scale": "item",
        "semantic_role": "input records before embedding",
        "shape": "B x N_item x input_fields",
        "carries": [
          "raw features",
          "masks"
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "id": "item_state",
        "scale": "item",
        "semantic_role": "mutable fine-scale latent state",
        "shape": "B x N_item x d_item",
        "carries": [
          "local content",
          "positional features"
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "id": "conditioning_signal",
        "scale": "item",
        "semantic_role": "per-item conditioning stream",
        "shape": "B x N_item x d_cond",
        "carries": [
          "control signal"
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "id": "pair_context",
        "scale": "item_pair",
        "semantic_role": "pair/context attention bias source",
        "shape": "B x N_group x N_group x d_pair",
        "carries": [
          "relation features",
          "mask features"
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "id": "item_to_group_index",
        "scale": "index_map",
        "semantic_role": "maps fine items to coarse groups",
        "shape": "B x N_item",
        "carries": [
          "group ownership"
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "id": "group_state",
        "scale": "group",
        "semantic_role": "compressed coarse latent state",
        "shape": "B x N_group x d_group",
        "carries": [
          "pooled item evidence",
          "refined context"
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "id": "item_output_state",
        "scale": "item",
        "semantic_role": "item-scale decoded state",
        "shape": "B x N_item x d_out",
        "carries": [
          "broadcast group context",
          "fine item skip"
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "id": "predictions",
        "scale": "output",
        "semantic_role": "task-specific output values",
        "shape": "B x N_item x output_fields",
        "carries": [
          "prediction heads"
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      }
    ],
    "execution": {
      "loops": [
        {
          "id": "refinement_loop",
          "repeats": "configurable_refinement_steps",
          "reruns": [
            "input_adapter",
            "item_encoder",
            "group_refiner",
            "output_decoder"
          ],
          "cached": [
            "attention_mask",
            "item_to_group_index"
          ],
          "notes": [
            "Context can be cached when the inputs and grouping map do not change."
          ],
          "evidence": {
            "status": "inferred",
            "refs": [
              {
                "kind": "protocol",
                "path": "protocol/architecture-language.md",
                "note": "Demonstrates how loops are represented."
              }
            ]
          }
        }
      ]
    },
    "stateSemantics": {
      "item_state": {
        "role": "mutable_state",
        "produced_by": "input_adapter",
        "updated_by": [
          "item_encoder"
        ],
        "consumed_by": [
          "item_to_group_pool",
          "output_heads"
        ],
        "notes": [
          "The item stream is the fine-scale mutable state."
        ]
      },
      "pair_context": {
        "role": "read_only_conditioning",
        "produced_by": "context_builder",
        "updated_by": [

        ],
        "consumed_by": [
          "group_refiner"
        ],
        "notes": [
          "It is projected to attention-logit bias but is not updated by the refiner in this demo."
        ]
      },
      "group_state": {
        "role": "mutable_state",
        "produced_by": "item_to_group_pool",
        "updated_by": [
          "group_refiner"
        ],
        "consumed_by": [
          "output_decoder"
        ]
      }
    },
    "conditioning": [
      {
        "id": "item_adaln",
        "source": "conditioning_signal",
        "target": "item_encoder",
        "mode": "per_item_adaln",
        "standard_block_ref": "standard_blocks/per-item-adaln-conditioning.yaml",
        "updates_source": false,
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml",
              "note": "Neutral demo conditioning path."
            }
          ]
        }
      },
      {
        "id": "group_pair_bias",
        "source": "pair_context",
        "target": "group_refiner.attention_logits",
        "mode": "pair_bias",
        "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
        "updates_source": false,
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml",
              "note": "Neutral demo pair/context bias path."
            }
          ]
        }
      }
    ],
    "scaleTransitions": [
      {
        "id": "item_to_group_pool",
        "from_scale": "item",
        "to_scale": "group",
        "source": "item_state",
        "target": "group_state",
        "projection": "item_to_group_projection",
        "index_map": "item_to_group_index",
        "aggregation": "scatter_mean",
        "copy_vs_pool": "pool",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml",
              "note": "Neutral demo compression path."
            }
          ]
        }
      },
      {
        "id": "group_to_item_broadcast",
        "from_scale": "group",
        "to_scale": "item",
        "source": "group_state",
        "target": "item_output_state",
        "projection": "group_to_item_projection",
        "index_map": "item_to_group_index",
        "aggregation": "gather",
        "copy_vs_pool": "copy",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml",
              "note": "Neutral demo broadcast path."
            }
          ]
        }
      }
    ],
    "trainingInference": {
      "objective": {
        "kind": "unknown"
      },
      "schedule": {
        "kind": "none"
      },
      "sampler": {
        "kind": "one_shot"
      },
      "teacher_forcing": "unknown",
      "self_conditioning": "unknown",
      "checkpoint_notes": [
        "This demo is architectural only; it is not tied to a training recipe."
      ]
    },
    "edges": [
      {
        "from": "raw_records",
        "to": "input_adapter",
        "carries": [
          "raw fields"
        ],
        "operation": "embed_inputs",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "from": "input_adapter",
        "to": "item_state",
        "carries": [
          "item_state"
        ],
        "operation": "initialize_state",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "from": "input_adapter",
        "to": "conditioning_signal",
        "carries": [
          "conditioning_signal"
        ],
        "operation": "initialize_conditioning",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "from": "item_state",
        "to": "context_builder",
        "carries": [
          "item_state"
        ],
        "operation": "pair_context_construction",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "from": "context_builder",
        "to": "pair_context",
        "carries": [
          "pair_context"
        ],
        "operation": "build_pair_context",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "from": "item_state",
        "to": "item_encoder",
        "carries": [
          "item_state"
        ],
        "operation": "item_attention_update",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "from": "conditioning_signal",
        "to": "item_encoder",
        "carries": [
          "conditioning_signal"
        ],
        "operation": "adaptive_conditioning",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "from": "item_encoder",
        "to": "item_to_group_pool",
        "carries": [
          "item_state"
        ],
        "operation": "prepare_compression",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "from": "item_to_group_pool",
        "to": "group_state",
        "carries": [
          "group_state"
        ],
        "operation": "scatter_mean",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "from": "group_state",
        "to": "group_refiner",
        "carries": [
          "group_state"
        ],
        "operation": "group_attention_update",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "from": "pair_context",
        "to": "group_refiner",
        "carries": [
          "pair_context"
        ],
        "operation": "pair_bias",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "from": "group_refiner",
        "to": "output_decoder",
        "carries": [
          "group_state"
        ],
        "operation": "decode_groups",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "from": "output_decoder",
        "to": "item_output_state",
        "carries": [
          "item_output_state"
        ],
        "operation": "broadcast_and_fuse",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "from": "item_output_state",
        "to": "output_heads",
        "carries": [
          "item_output_state"
        ],
        "operation": "output_projection",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      },
      {
        "from": "output_heads",
        "to": "predictions",
        "carries": [
          "predictions"
        ],
        "operation": "predict",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "kind": "source",
              "path": "architectures/generic-feature-refinement.yaml"
            }
          ]
        }
      }
    ],
    "claims": [
      "The pair/context stream is used as attention-logit conditioning in the group refiner and is not updated there.",
      "The item-to-group transition is modeled as pooling, while the group-to-item transition is modeled as broadcast/gather."
    ]
  },
  "standardBlocks": {
    "pair_biased_attention": {
      "id": "pair_biased_attention",
      "name": "Pair-Biased Attention",
      "sourceYaml": "../../standard_blocks/pair-biased-attention.yaml",
      "description": "Add a projected pair/context representation to query-key attention logits before masking and softmax.",
      "math": [
        {
          "id": "qk_logits",
          "text": "logits_ijh = dot(q_ih, k_jh) * scale",
          "tex": "\\ell^{qk}_{ijh} = \\langle q_{ih}, k_{jh} \\rangle \\cdot s",
          "operation": "attention_logits"
        },
        {
          "id": "project_pair",
          "text": "pair_bias_ijh = Linear(LayerNorm(c_ij))",
          "tex": "b_{ijh} = W_h\\,\\operatorname{LN}(c_{ij})",
          "operation": "projection"
        },
        {
          "id": "add_pair_bias",
          "text": "logits_ijh = logits_ijh + pair_bias_ijh",
          "tex": "\\ell_{ijh} = \\ell^{qk}_{ijh} + b_{ijh}",
          "operation": "pair_bias_add"
        },
        {
          "id": "apply_mask",
          "text": "logits = logits + mask_bias",
          "tex": "\\ell_{ijh} = \\ell_{ijh} + m_{ij}",
          "operation": "attention_mask"
        },
        {
          "id": "softmax",
          "text": "weights_ijh = softmax_j(logits_ijh)",
          "tex": "a_{ijh} = \\operatorname{softmax}_j(\\ell_{ijh})",
          "operation": "softmax"
        },
        {
          "id": "gather_values",
          "text": "context_ih = sum_j weights_ijh * v_jh",
          "tex": "o_{ih} = \\sum_j a_{ijh} v_{jh}",
          "operation": "weighted_sum"
        }
      ]
    },
    "per_item_adaln_conditioning": {
      "id": "per_item_adaln_conditioning",
      "name": "Per-Item AdaLN Conditioning",
      "sourceYaml": "../../standard_blocks/per-item-adaln-conditioning.yaml",
      "description": "Use a per-item conditioning stream to produce adaptive normalization shifts, scales, and gates for item updates.",
      "math": [
        {
          "id": "normalize_item",
          "text": "u_i = LayerNorm(x_i)",
          "tex": "u_i = \\operatorname{LN}(x_i)",
          "operation": "normalize"
        },
        {
          "id": "project_conditioning",
          "text": "shift_i, scale_i, gate_i = Linear(s_i)",
          "tex": "\\beta_i, \\gamma_i, g_i = W s_i",
          "operation": "conditioning_projection"
        },
        {
          "id": "modulate",
          "text": "y_i = gate_i * (scale_i * u_i + shift_i)",
          "tex": "y_i = g_i \\odot (\\gamma_i \\odot u_i + \\beta_i)",
          "operation": "adaptive_modulation"
        }
      ]
    },
    "additive_conditioning": {
      "id": "additive_conditioning",
      "name": "Additive Conditioning",
      "sourceYaml": "../../standard_blocks/additive-conditioning.yaml",
      "description": "Project a conditioning stream and add it into a mutable state.",
      "math": [
        {
          "id": "project_conditioning",
          "text": "delta = Linear(LayerNorm(condition))",
          "tex": "\\Delta = W\\,\\operatorname{LN}(c)",
          "operation": "projection"
        },
        {
          "id": "add_conditioning",
          "text": "state = state + delta",
          "tex": "x' = x + \\Delta",
          "operation": "additive_injection"
        }
      ]
    }
  },
  "pseudocode": {
    "generic_feature_refinement": {
      "sourceYaml": "../../pseudocode/generic-feature-refinement.yaml",
      "lines": [
        {
          "id": "adapt_inputs",
          "text": "x, s, item_to_group = InputAdapter(raw_records)",
          "refs": "input_adapter",
          "architectureRefs": [
            "modules.input_adapter"
          ]
        },
        {
          "id": "build_context",
          "text": "c = ContextBuilder(x, item_to_group)",
          "refs": "context_builder",
          "architectureRefs": [
            "modules.context_builder",
            "representations.pair_context"
          ]
        },
        {
          "id": "item_adaln",
          "text": "x = ItemEncoder(x, cond=s)",
          "refs": "item_encoder",
          "architectureRefs": [
            "modules.item_encoder"
          ],
          "standardBlockRef": "../../standard_blocks/per-item-adaln-conditioning.yaml"
        },
        {
          "id": "pool_groups",
          "text": "g = scatter_mean(Project(x), item_to_group)",
          "refs": "item_to_group_pool",
          "architectureRefs": [
            "modules.item_to_group_pool",
            "representations.group_state"
          ]
        },
        {
          "id": "pair_bias_refine",
          "text": "g = GroupRefiner(g, pair_bias=Linear(LayerNorm(c)))",
          "refs": "group_refiner",
          "architectureRefs": [
            "modules.group_refiner",
            "claims.context_bias_is_read_only"
          ],
          "standardBlockRef": "../../standard_blocks/pair-biased-attention.yaml"
        },
        {
          "id": "broadcast_groups",
          "text": "o = OutputDecoder(gather(g, item_to_group), skip=x)",
          "refs": "output_decoder",
          "architectureRefs": [
            "modules.output_decoder",
            "claims.compression_is_explicit"
          ]
        },
        {
          "id": "predict",
          "text": "y = OutputHeads(o)",
          "refs": "output_heads",
          "architectureRefs": [
            "modules.output_heads"
          ]
        }
      ]
    }
  },
  "boards": {
    "sourceYaml": "../../views/generic-semantic-zoom.view.yaml",
    "rootBoard": "generic_overview",
    "items": [
      {
        "id": "generic_overview",
        "title": "Generic Feature Refinement",
        "summary": "A one-block overview. Open the refinement pipeline to inspect input adaptation, item updates, group compression, pair/context bias, broadcast, and output heads.",
        "scale_lanes": false,
        "grid": {
          "columns": 3,
          "rows": 3
        },
        "nodes": [
          {
            "id": "refinement_pipeline",
            "kind": "module",
            "label": "Feature refinement pipeline",
            "scale": "abstract",
            "role": "domain-neutral architecture scaffold",
            "detail": "inputs -> item encoder -> group refiner -> output decoder",
            "col": 2,
            "row": 2,
            "expandable": true
          }
        ]
      },
      {
        "id": "refinement_pipeline",
        "title": "Feature Refinement Pipeline",
        "summary": "The pipeline embeds records, updates item states, compresses them to group states, refines groups with pair/context bias, then broadcasts back to item outputs.",
        "parent": "generic_overview",
        "grid": {
          "columns": 7,
          "rows": 5
        },
        "nodes": [
          {
            "id": "raw_records",
            "kind": "representation",
            "rep_ref": "raw_records",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 3
          },
          {
            "id": "input_adapter",
            "kind": "module",
            "module_ref": "input_adapter",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 3
          },
          {
            "id": "conditioning_signal",
            "kind": "representation",
            "rep_ref": "conditioning_signal",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 1
          },
          {
            "id": "item_state",
            "kind": "representation",
            "rep_ref": "item_state",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 3
          },
          {
            "id": "context_builder",
            "kind": "module",
            "module_ref": "context_builder",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 2
          },
          {
            "id": "pair_context",
            "kind": "representation",
            "rep_ref": "pair_context",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 1
          },
          {
            "id": "item_encoder",
            "kind": "module",
            "module_ref": "item_encoder",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 3,
            "expandable": true
          },
          {
            "id": "item_to_group_pool",
            "kind": "module",
            "module_ref": "item_to_group_pool",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 3
          },
          {
            "id": "group_state",
            "kind": "representation",
            "rep_ref": "group_state",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 2
          },
          {
            "id": "group_refiner",
            "kind": "module",
            "module_ref": "group_refiner",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 2,
            "expandable": true
          },
          {
            "id": "output_decoder",
            "kind": "module",
            "module_ref": "output_decoder",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 4
          },
          {
            "id": "item_output_state",
            "kind": "representation",
            "rep_ref": "item_output_state",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 4
          },
          {
            "id": "output_heads",
            "kind": "module",
            "module_ref": "output_heads",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 3
          },
          {
            "id": "predictions",
            "kind": "representation",
            "rep_ref": "predictions",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 7,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "raw_records",
            "to": "input_adapter",
            "label": "fields",
            "connection": {
              "title": "Raw records to adapter",
              "role": "input embedding",
              "inside": "The adapter turns raw fields into latent item state, conditioning, masks, and grouping indices."
            }
          },
          {
            "from": "input_adapter",
            "to": "item_state",
            "label": "item state",
            "connection": {
              "title": "Adapter initializes item state",
              "role": "mutable fine-scale state",
              "inside": "The item stream is the fine-resolution state updated by the item encoder."
            }
          },
          {
            "from": "input_adapter",
            "to": "conditioning_signal",
            "label": "cond",
            "tone": "conditioning",
            "connection": {
              "title": "Adapter builds conditioning",
              "role": "adaptive modulation source",
              "inside": "The conditioning signal is carried separately so item updates can be modulated without replacing item state."
            }
          },
          {
            "from": "item_state",
            "to": "context_builder",
            "label": "context feats",
            "connection": {
              "title": "Item features to context builder",
              "role": "pair/context construction",
              "inside": "The context builder summarizes relationships that later bias group attention."
            }
          },
          {
            "from": "context_builder",
            "to": "pair_context",
            "label": "C_ij",
            "tone": "conditioning",
            "connection": {
              "title": "Pair/context state",
              "role": "attention bias source",
              "inside": "Pair/context features are retained as read-only conditioning for the group refiner in this demo."
            }
          },
          {
            "from": "item_state",
            "to": "item_encoder",
            "label": "x_i",
            "connection": {
              "title": "Item state into encoder",
              "role": "local mutable state",
              "inside": "The item encoder applies local attention and feedforward updates to the item stream."
            }
          },
          {
            "from": "conditioning_signal",
            "to": "item_encoder",
            "label": "AdaLN",
            "tone": "conditioning",
            "connection": {
              "title": "Per-item adaptive modulation",
              "role": "conditioning inside item blocks",
              "inside": "Each item receives conditioning-derived shift, scale, and gate terms before the update."
            }
          },
          {
            "from": "item_encoder",
            "to": "item_to_group_pool",
            "label": "updated items",
            "connection": {
              "title": "Item encoder to compression",
              "role": "prepare coarse state",
              "inside": "Updated item states are grouped by an ownership index and projected before pooling."
            }
          },
          {
            "from": "item_to_group_pool",
            "to": "group_state",
            "label": "pool",
            "connection": {
              "title": "Item-to-group compression",
              "role": "pooling transition",
              "inside": "Multiple item states can contribute to one group state, so this is a compression rather than a reshape."
            }
          },
          {
            "from": "group_state",
            "to": "group_refiner",
            "label": "g_a",
            "connection": {
              "title": "Group state into refiner",
              "role": "coarse mutable state",
              "inside": "The refiner updates compressed group states with full attention."
            }
          },
          {
            "from": "pair_context",
            "to": "group_refiner",
            "label": "bias",
            "tone": "conditioning",
            "connection": {
              "title": "Pair/context bias",
              "role": "attention-logit conditioning",
              "inside": "Pair/context features are projected to per-head logits and added to group attention scores."
            }
          },
          {
            "from": "group_refiner",
            "to": "output_decoder",
            "label": "refined groups",
            "connection": {
              "title": "Refined groups to decoder",
              "role": "coarse-to-fine decoding",
              "inside": "The decoder broadcasts refined group state back to item resolution using the same ownership index."
            }
          },
          {
            "from": "output_decoder",
            "to": "item_output_state",
            "label": "broadcast",
            "connection": {
              "title": "Group-to-item broadcast",
              "role": "gather transition",
              "inside": "Each item receives the state of its owning group; this copies/broadcasts rather than pools."
            }
          },
          {
            "from": "item_output_state",
            "to": "output_heads",
            "label": "decoded items",
            "connection": {
              "title": "Decoded state into heads",
              "role": "output projection",
              "inside": "Output heads map item-scale decoded state to task-specific predictions."
            }
          },
          {
            "from": "output_heads",
            "to": "predictions",
            "label": "y",
            "connection": {
              "title": "Predictions",
              "role": "final outputs",
              "inside": "The output representation is intentionally generic and can be specialized by a concrete architecture."
            }
          }
        ]
      },
      {
        "id": "item_encoder",
        "title": "Item Encoder",
        "summary": "The item encoder is a local fine-scale stack conditioned by a per-item modulation stream.",
        "parent": "refinement_pipeline",
        "grid": {
          "columns": 5,
          "rows": 4
        },
        "nodes": [
          {
            "id": "item_state_in",
            "kind": "representation",
            "rep_ref": "item_state",
            "label": "item state in",
            "col": 1,
            "row": 2
          },
          {
            "id": "conditioning_signal",
            "kind": "representation",
            "rep_ref": "conditioning_signal",
            "col": 2,
            "row": 1
          },
          {
            "id": "adaln",
            "kind": "operation",
            "label": "per-item AdaLN",
            "scale": "item",
            "role": "produce shift, scale, and gate for each item update",
            "col": 2,
            "row": 2
          },
          {
            "id": "local_attention",
            "kind": "module",
            "module_ref": "item_encoder",
            "label": "local attention stack",
            "col": 3,
            "row": 2
          },
          {
            "id": "item_state_out",
            "kind": "representation",
            "rep_ref": "item_state",
            "label": "item state out",
            "col": 4,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "item_state_in",
            "to": "adaln",
            "label": "x_i",
            "connection": {
              "title": "Normalize item state",
              "role": "block input",
              "inside": "Item state is normalized before receiving conditioning-derived modulation."
            }
          },
          {
            "from": "conditioning_signal",
            "to": "adaln",
            "label": "shift/scale/gate",
            "tone": "conditioning",
            "connection": {
              "title": "Per-item modulation",
              "role": "adaptive conditioning",
              "inside": "The conditioning stream is projected independently at each item position."
            }
          },
          {
            "from": "adaln",
            "to": "local_attention",
            "label": "modulated x",
            "connection": {
              "title": "Modulated item state",
              "role": "attention input",
              "inside": "The modulated stream is fed into the local attention and feedforward update."
            }
          },
          {
            "from": "local_attention",
            "to": "item_state_out",
            "label": "x'_i",
            "connection": {
              "title": "Updated item state",
              "role": "mutable output",
              "inside": "The stack returns an item-scale state with the same ownership layout."
            }
          }
        ]
      },
      {
        "id": "group_refiner",
        "title": "Group Refiner",
        "summary": "The group refiner updates compressed group states with pair/context-biased full attention.",
        "parent": "refinement_pipeline",
        "grid": {
          "columns": 5,
          "rows": 4
        },
        "nodes": [
          {
            "id": "group_state_in",
            "kind": "representation",
            "rep_ref": "group_state",
            "label": "group state in",
            "col": 1,
            "row": 2
          },
          {
            "id": "pair_context",
            "kind": "representation",
            "rep_ref": "pair_context",
            "col": 2,
            "row": 1
          },
          {
            "id": "pair_biased_attention",
            "kind": "module",
            "module_ref": "group_refiner",
            "label": "pair-biased attention",
            "col": 3,
            "row": 2
          },
          {
            "id": "group_state_out",
            "kind": "representation",
            "rep_ref": "group_state",
            "label": "group state out",
            "col": 4,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "group_state_in",
            "to": "pair_biased_attention",
            "label": "Q/K/V",
            "connection": {
              "title": "Group state as attention stream",
              "role": "mutable state",
              "inside": "Group state supplies query, key, and value projections."
            }
          },
          {
            "from": "pair_context",
            "to": "pair_biased_attention",
            "label": "bias",
            "tone": "conditioning",
            "connection": {
              "title": "Pair/context to logits",
              "role": "attention-logit bias",
              "inside": "Pair/context features are projected to bias terms and added before softmax."
            }
          },
          {
            "from": "pair_biased_attention",
            "to": "group_state_out",
            "label": "update",
            "connection": {
              "title": "Refined group state",
              "role": "mutable output",
              "inside": "The attention output updates group state while pair/context remains read-only in this demo."
            }
          }
        ]
      }
    ]
  }
};\n
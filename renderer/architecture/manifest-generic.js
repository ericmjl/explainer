export const manifest = {
  "schemaVersion": "architecture-manifest-v0.4",
  "build": {
    "generator": "architecture-manifest-builder-v0.4.6",
    "inputDigests": {
      "references/bibliography.yaml": "abe9226586bfb64261c81b7756b7275c48a3a172a9a18b5f91f7acfd3145e374",
      "architectures/generic-feature-refinement.yaml": "60b45e458ee2037560fc3011507148f3f236d19d8957b9d1826fa7b5a2e0cc0e",
      "views/generic-semantic-zoom.view.yaml": "2212d81c8217db03c68fa7d59f44dc36e55052503d8d503b3386bded040b5714",
      "pseudocode/generic-feature-refinement.yaml": "7020e10be441c1d161e8113b54937fd89c303ef55f198fd2432bc69243e55696",
      "standard_blocks/pair-biased-attention.yaml": "88379fcd3ad641e38da23ce3b5a9ccef84344149d9c8fac51792ad63cb9da7dc",
      "standard_blocks/per-item-adaln-conditioning.yaml": "544bca1c4d238825bfe6e389fe0409e64b27726b54f737e86021a0dc078987f9",
      "standard_blocks/additive-conditioning.yaml": "5638ead7cbb2df6729e58393703d3e35b6e480b3ba42c657312dc6581bb032f7"
    }
  },
  "architecture": {
    "schemaVersion": "architecture-v0.4",
    "id": "generic_feature_refinement",
    "name": "Generic Feature Refinement Pipeline",
    "family": "transformer",
    "status": "draft",
    "taskModes": [
      "prediction",
      "generation"
    ],
    "referenceConfiguration": null,
    "sourceYaml": "../../architectures/generic-feature-refinement.yaml",
    "sources": [
      {
        "source_ref": "generic_feature_refinement_source",
        "role": "architecture_source"
      },
      {
        "source_ref": "architecture_language_protocol",
        "role": "specification"
      }
    ],
    "decomposition": {
      "status": "complete",
      "evidence": {
        "status": "inferred",
        "refs": [
          {
            "source_ref": "generic_feature_refinement_source",
            "role": "scaffold_evidence",
            "note": "The root child set is exhaustive for this intentionally bounded demonstration architecture."
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
          "immediateModuleCount": 7,
          "immediateModuleRefs": [
            "modules.input_adapter",
            "modules.context_builder",
            "modules.item_encoder",
            "modules.item_to_group_pool",
            "modules.group_refiner",
            "modules.output_decoder",
            "modules.output_heads"
          ]
        },
        "modules.input_adapter": {
          "status": "leaf",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.context_builder": {
          "status": "leaf",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.item_encoder": {
          "status": "complete",
          "depth": 1,
          "immediateModuleCount": 2,
          "immediateModuleRefs": [
            "modules.item_adaln",
            "modules.local_attention_stack"
          ]
        },
        "modules.item_adaln": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.local_attention_stack": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.item_to_group_pool": {
          "status": "leaf",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.group_refiner": {
          "status": "complete",
          "depth": 1,
          "immediateModuleCount": 1,
          "immediateModuleRefs": [
            "modules.pair_biased_attention"
          ]
        },
        "modules.pair_biased_attention": {
          "status": "leaf",
          "depth": 2,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.output_decoder": {
          "status": "leaf",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        },
        "modules.output_heads": {
          "status": "leaf",
          "depth": 1,
          "immediateModuleCount": 0,
          "immediateModuleRefs": [

          ]
        }
      },
      "summary": {
        "scopeCount": 11,
        "expandedScopeCount": 3,
        "completeExpandedScopeCount": 3,
        "partialScopeCount": 0,
        "leafFrontierCount": 8,
        "opaqueFrontierCount": 0,
        "partialFrontierCount": 0,
        "maximumAuthoredDepth": 2
      },
      "opaqueFrontierRefs": [

      ],
      "partialScopeRefs": [

      ]
    },
    "modules": [
      {
        "id": "input_adapter",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Input Adapter",
        "kind": "adapter",
        "mechanisms": [
          "input_featurization"
        ],
        "role": "embed raw records and build initial item state, conditioning signal, masks, and grouping indices",
        "scale": "item",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "context_builder",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Context Builder",
        "kind": "encoder",
        "mechanisms": [
          "pair_context"
        ],
        "role": "construct pair/context features used later as attention bias",
        "scale": "item_pair",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_encoder",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "complete"
        },
        "label": "Item Encoder",
        "kind": "encoder",
        "mechanisms": [
          "attention",
          "adaptive_normalization"
        ],
        "role": "update fine-scale item state with local attention and per-item conditioning",
        "scale": "item",
        "repeats": 3,
        "pseudocode_ref": "../../pseudocode/generic-feature-refinement.yaml",
        "depth": {
          "blocks": 3,
          "heads": 8
        },
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_adaln",
        "parent_ref": "modules.item_encoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Per-item AdaLN",
        "kind": "normalization",
        "mechanisms": [
          "adaptive_normalization"
        ],
        "role": "produce shift, scale, and gate for each item update",
        "scale": "item",
        "standard_block_ref": "../../standard_blocks/per-item-adaln-conditioning.yaml",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "local_attention_stack",
        "parent_ref": "modules.item_encoder",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Local Attention Stack",
        "kind": "attention",
        "mechanisms": [
          "local_attention"
        ],
        "role": "apply local attention and feedforward updates to the modulated item stream",
        "scale": "item",
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
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_to_group_pool",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Item-to-Group Pool",
        "kind": "adapter",
        "mechanisms": [
          "pooling"
        ],
        "role": "compress item states into group states using an ownership index",
        "scale": "group",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "group_refiner",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "complete"
        },
        "label": "Group Refiner",
        "kind": "refiner",
        "mechanisms": [
          "attention",
          "pair_biased_attention"
        ],
        "role": "update compressed group state with full attention and pair/context bias",
        "scale": "group",
        "repeats": 6,
        "pseudocode_ref": "../../pseudocode/generic-feature-refinement.yaml",
        "depth": {
          "blocks": 6,
          "heads": 8
        },
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "pair_biased_attention",
        "parent_ref": "modules.group_refiner",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Pair-biased Attention",
        "kind": "attention",
        "mechanisms": [
          "pair_biased_attention"
        ],
        "role": "update group state with full attention and pair/context logit bias",
        "scale": "group",
        "attention": {
          "pattern": "full",
          "query_scale": "group",
          "key_value_scale": "group",
          "heads": 8,
          "pair_bias": true,
          "pair_bias_source": "pair_context",
          "positional_encoding": {
            "kind": "relative_position"
          }
        },
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "output_decoder",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Output Decoder",
        "kind": "decoder",
        "role": "broadcast group output back to item resolution and fuse the item skip state",
        "scale": "item",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "output_heads",
        "parent_ref": "architecture",
        "decomposition": {
          "status": "leaf"
        },
        "label": "Output Heads",
        "kind": "prediction_head",
        "role": "project decoded item state to task-specific predictions",
        "scale": "output",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      }
    ],
    "blockInstances": [
      {
        "id": "generic_group_pair_attention",
        "standardBlockId": "pair_biased_attention",
        "standardBlockRef": "standard_blocks/pair-biased-attention.yaml",
        "standardBlockName": "Pair-Biased Attention",
        "subjectRef": "modules.pair_biased_attention",
        "variant": "logit_bias_only",
        "variantLabel": "Pair-logit bias",
        "variantDescription": "Standard self-attention with a projected pair term added to logits; pair features are not aggregated as values.",
        "useScope": "whole_module",
        "conformance": "exact",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence",
              "note": "The generic source set deliberately instantiates the logit-bias-only variant as reusable vocabulary."
            }
          ]
        },
        "portBindings": [
          {
            "portRef": "ports.single_state",
            "relationRefs": [
              "relations.group_state_enters_pair_attention"
            ],
            "relations": [
              {
                "relationRef": "relations.group_state_enters_pair_attention",
                "from": "value_sites.group_state_before_refiner",
                "to": "modules.pair_biased_attention",
                "kind": "data_flow",
                "operation": "project_queries_keys_values",
                "carries": [
                  "representations.group_state"
                ]
              }
            ]
          },
          {
            "portRef": "ports.pair_context",
            "relationRefs": [
              "relations.pair_context_biases_pair_attention"
            ],
            "relations": [
              {
                "relationRef": "relations.pair_context_biases_pair_attention",
                "from": "value_sites.pair_context",
                "to": "modules.pair_biased_attention",
                "kind": "conditioning",
                "operation": "pair_bias",
                "carries": [
                  "representations.pair_context"
                ]
              }
            ]
          },
          {
            "portRef": "ports.updated_single_state",
            "relationRefs": [
              "relations.pair_attention_updates_group_state"
            ],
            "relations": [
              {
                "relationRef": "relations.pair_attention_updates_group_state",
                "from": "modules.pair_biased_attention",
                "to": "value_sites.group_state_after_refiner",
                "kind": "data_flow",
                "operation": "group_attention_update",
                "carries": [
                  "representations.group_state"
                ]
              }
            ]
          }
        ],
        "pseudocode": [
          {
            "id": "project_qkv",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_qkv",
            "instanceFactRef": "block_instances.generic_group_pair_attention.steps.project_qkv",
            "label": "Project Q, K, and V",
            "operation": "qkv_projection",
            "code": "q, k, v = project_qkv(single_state)",
            "tex": "q_i, k_i, v_i = W_{qkv}s_i",
            "inputs": [
              "ports.single_state"
            ],
            "outputs": [
              "values.queries",
              "values.keys",
              "values.scalar_values"
            ]
          },
          {
            "id": "scalar_logits",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.scalar_logits",
            "instanceFactRef": "block_instances.generic_group_pair_attention.steps.scalar_logits",
            "label": "Form query-key logits",
            "operation": "attention_logits",
            "code": "scalar_logits = einsum(q, k) * scale",
            "tex": "ell^{qk}_{ijh} = <q_{ih}, k_{jh}> s_h",
            "inputs": [
              "values.queries",
              "values.keys"
            ],
            "outputs": [
              "values.scalar_logits"
            ]
          },
          {
            "id": "project_pair_bias",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_pair_bias",
            "instanceFactRef": "block_instances.generic_group_pair_attention.steps.project_pair_bias",
            "label": "Project pair bias",
            "operation": "pair_bias_projection",
            "code": "pair_bias = project_pair(pair_context)",
            "tex": "b_{ijh} = W_h z_{ij}",
            "inputs": [
              "ports.pair_context"
            ],
            "outputs": [
              "values.pair_bias"
            ]
          },
          {
            "id": "combine_logits",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.combine_logits",
            "instanceFactRef": "block_instances.generic_group_pair_attention.steps.combine_logits",
            "label": "Add pair bias",
            "operation": "pair_bias_add",
            "code": "biased_logits = scalar_logits + pair_bias",
            "tex": "ell_{ijh} = ell^{qk}_{ijh} + b_{ijh}",
            "inputs": [
              "values.scalar_logits",
              "values.pair_bias"
            ],
            "outputs": [
              "values.biased_logits"
            ]
          },
          {
            "id": "softmax_attention_unmasked",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.softmax_attention_unmasked",
            "instanceFactRef": "block_instances.generic_group_pair_attention.steps.softmax_attention_unmasked",
            "label": "Normalize attention",
            "operation": "softmax",
            "code": "attention = softmax(biased_logits, dim=keys)",
            "tex": "a_{ijh} = softmax_j(ell_{ijh})",
            "inputs": [
              "values.biased_logits"
            ],
            "outputs": [
              "values.attention_weights"
            ]
          },
          {
            "id": "aggregate_scalar_values",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.aggregate_scalar_values",
            "instanceFactRef": "block_instances.generic_group_pair_attention.steps.aggregate_scalar_values",
            "label": "Aggregate scalar values",
            "operation": "weighted_sum",
            "code": "scalar_context = einsum(attention, v)",
            "tex": "o^s_{ih} = sum_j a_{ijh} v_{jh}",
            "inputs": [
              "values.attention_weights",
              "values.scalar_values"
            ],
            "outputs": [
              "values.scalar_context"
            ]
          },
          {
            "id": "project_attention_output",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_attention_output",
            "instanceFactRef": "block_instances.generic_group_pair_attention.steps.project_attention_output",
            "label": "Project attention output",
            "operation": "output_projection",
            "code": "updated_single_state = output_projection(scalar_context)",
            "inputs": [
              "values.scalar_context"
            ],
            "outputs": [
              "ports.updated_single_state"
            ]
          }
        ]
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
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
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
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
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
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
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
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
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
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
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
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
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
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
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
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      }
    ],
    "valueSites": [
      {
        "id": "raw_records_input",
        "representation_ref": "representations.raw_records",
        "scope_ref": "architecture",
        "boundary": "input",
        "role": "task_input",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_state_before_encoder",
        "representation_ref": "representations.item_state",
        "scope_ref": "modules.input_adapter",
        "role": "state_write",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "conditioning_signal",
        "representation_ref": "representations.conditioning_signal",
        "scope_ref": "modules.input_adapter",
        "role": "read_only_conditioning",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_to_group_index",
        "representation_ref": "representations.item_to_group_index",
        "scope_ref": "modules.input_adapter",
        "role": "index_map",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "pair_context",
        "representation_ref": "representations.pair_context",
        "scope_ref": "modules.context_builder",
        "role": "read_only_conditioning",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_state_after_encoder",
        "representation_ref": "representations.item_state",
        "scope_ref": "modules.item_encoder",
        "role": "state_write",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "group_state_before_refiner",
        "representation_ref": "representations.group_state",
        "scope_ref": "modules.item_to_group_pool",
        "role": "state_write",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "group_state_after_refiner",
        "representation_ref": "representations.group_state",
        "scope_ref": "modules.group_refiner",
        "role": "state_write",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_output_state",
        "representation_ref": "representations.item_output_state",
        "scope_ref": "modules.output_decoder",
        "role": "decoded_state",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "predictions_output",
        "representation_ref": "representations.predictions",
        "scope_ref": "architecture",
        "boundary": "output",
        "role": "task_output",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      }
    ],
    "valueSiteInterfaces": {
      "raw_records_input": {
        "incomingRelationRefs": [

        ],
        "outgoingRelationRefs": [
          "relations.raw_records_enter_input_adapter"
        ],
        "producerRefs": [

        ],
        "consumerRefs": [
          "modules.input_adapter"
        ]
      },
      "item_state_before_encoder": {
        "incomingRelationRefs": [
          "relations.input_adapter_initializes_item_state"
        ],
        "outgoingRelationRefs": [
          "relations.item_state_feeds_context_builder",
          "relations.item_state_enters_item_adaln"
        ],
        "producerRefs": [
          "modules.input_adapter"
        ],
        "consumerRefs": [
          "modules.context_builder",
          "modules.item_adaln"
        ]
      },
      "conditioning_signal": {
        "incomingRelationRefs": [
          "relations.input_adapter_initializes_conditioning_signal"
        ],
        "outgoingRelationRefs": [
          "relations.conditioning_signal_modulates_item_adaln"
        ],
        "producerRefs": [
          "modules.input_adapter"
        ],
        "consumerRefs": [
          "modules.item_adaln"
        ]
      },
      "item_to_group_index": {
        "incomingRelationRefs": [
          "relations.input_adapter_produces_item_to_group_index"
        ],
        "outgoingRelationRefs": [
          "relations.item_to_group_index_guides_context_builder",
          "relations.item_to_group_index_guides_pooling",
          "relations.item_to_group_index_guides_output_decoder"
        ],
        "producerRefs": [
          "modules.input_adapter"
        ],
        "consumerRefs": [
          "modules.context_builder",
          "modules.item_to_group_pool",
          "modules.output_decoder"
        ]
      },
      "pair_context": {
        "incomingRelationRefs": [
          "relations.context_builder_produces_pair_context"
        ],
        "outgoingRelationRefs": [
          "relations.pair_context_biases_pair_attention"
        ],
        "producerRefs": [
          "modules.context_builder"
        ],
        "consumerRefs": [
          "modules.pair_biased_attention"
        ]
      },
      "item_state_after_encoder": {
        "incomingRelationRefs": [
          "relations.local_attention_updates_item_state"
        ],
        "outgoingRelationRefs": [
          "relations.encoded_item_state_enters_group_pool",
          "relations.encoded_item_state_skips_to_output_decoder"
        ],
        "producerRefs": [
          "modules.local_attention_stack"
        ],
        "consumerRefs": [
          "modules.item_to_group_pool",
          "modules.output_decoder"
        ]
      },
      "group_state_before_refiner": {
        "incomingRelationRefs": [
          "relations.item_to_group_pool_produces_group_state"
        ],
        "outgoingRelationRefs": [
          "relations.group_state_enters_pair_attention"
        ],
        "producerRefs": [
          "modules.item_to_group_pool"
        ],
        "consumerRefs": [
          "modules.pair_biased_attention"
        ]
      },
      "group_state_after_refiner": {
        "incomingRelationRefs": [
          "relations.pair_attention_updates_group_state"
        ],
        "outgoingRelationRefs": [
          "relations.refined_group_state_enters_output_decoder"
        ],
        "producerRefs": [
          "modules.pair_biased_attention"
        ],
        "consumerRefs": [
          "modules.output_decoder"
        ]
      },
      "item_output_state": {
        "incomingRelationRefs": [
          "relations.output_decoder_produces_item_output_state"
        ],
        "outgoingRelationRefs": [
          "relations.item_output_state_feeds_output_heads"
        ],
        "producerRefs": [
          "modules.output_decoder"
        ],
        "consumerRefs": [
          "modules.output_heads"
        ]
      },
      "predictions_output": {
        "incomingRelationRefs": [
          "relations.output_heads_produce_predictions"
        ],
        "outgoingRelationRefs": [

        ],
        "producerRefs": [
          "modules.output_heads"
        ],
        "consumerRefs": [

        ]
      }
    },
    "execution": {
      "loops": [
        {
          "id": "refinement_loop",
          "repeats": "configurable_refinement_steps",
          "reruns": [
            "modules.input_adapter",
            "modules.item_encoder",
            "modules.group_refiner",
            "modules.output_decoder"
          ],
          "cached": [
            "value_sites.item_to_group_index",
            "value_sites.pair_context"
          ],
          "notes": [
            "Context, attention masks, and grouping indices can be cached when the inputs and grouping map do not change."
          ],
          "evidence": {
            "status": "inferred",
            "refs": [
              {
                "source_ref": "architecture_language_protocol",
                "role": "specification",
                "note": "Demonstrates how loops are represented."
              }
            ]
          }
        }
      ]
    },
    "stateSemantics": {
      "item_state": {
        "representation_ref": "representations.item_state",
        "value_site_refs": [
          "value_sites.item_state_before_encoder",
          "value_sites.item_state_after_encoder"
        ],
        "lifecycle": "transformed_within_refinement_loop",
        "notes": [
          "The before and after sites make the fine-scale state update explicit without conflating two temporal values."
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      "pair_context": {
        "representation_ref": "representations.pair_context",
        "value_site_refs": [
          "value_sites.pair_context"
        ],
        "lifecycle": "cached_read_only_context",
        "notes": [
          "It is projected to attention-logit bias but is not updated by the refiner in this demo."
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      "group_state": {
        "representation_ref": "representations.group_state",
        "value_site_refs": [
          "value_sites.group_state_before_refiner",
          "value_sites.group_state_after_refiner"
        ],
        "lifecycle": "transformed_within_refinement_loop",
        "notes": [
          "The before and after sites distinguish pooled group state from refined group state."
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      }
    },
    "stateSemanticsBySite": {
      "item_state_before_encoder": {
        "representation_ref": "representations.item_state",
        "value_site_refs": [
          "value_sites.item_state_before_encoder",
          "value_sites.item_state_after_encoder"
        ],
        "lifecycle": "transformed_within_refinement_loop",
        "notes": [
          "The before and after sites make the fine-scale state update explicit without conflating two temporal values."
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        },
        "groupId": "item_state"
      },
      "item_state_after_encoder": {
        "representation_ref": "representations.item_state",
        "value_site_refs": [
          "value_sites.item_state_before_encoder",
          "value_sites.item_state_after_encoder"
        ],
        "lifecycle": "transformed_within_refinement_loop",
        "notes": [
          "The before and after sites make the fine-scale state update explicit without conflating two temporal values."
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        },
        "groupId": "item_state"
      },
      "pair_context": {
        "representation_ref": "representations.pair_context",
        "value_site_refs": [
          "value_sites.pair_context"
        ],
        "lifecycle": "cached_read_only_context",
        "notes": [
          "It is projected to attention-logit bias but is not updated by the refiner in this demo."
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        },
        "groupId": "pair_context"
      },
      "group_state_before_refiner": {
        "representation_ref": "representations.group_state",
        "value_site_refs": [
          "value_sites.group_state_before_refiner",
          "value_sites.group_state_after_refiner"
        ],
        "lifecycle": "transformed_within_refinement_loop",
        "notes": [
          "The before and after sites distinguish pooled group state from refined group state."
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        },
        "groupId": "group_state"
      },
      "group_state_after_refiner": {
        "representation_ref": "representations.group_state",
        "value_site_refs": [
          "value_sites.group_state_before_refiner",
          "value_sites.group_state_after_refiner"
        ],
        "lifecycle": "transformed_within_refinement_loop",
        "notes": [
          "The before and after sites distinguish pooled group state from refined group state."
        ],
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        },
        "groupId": "group_state"
      }
    },
    "conditioning": [
      {
        "id": "item_adaln",
        "relation_ref": "relations.conditioning_signal_modulates_item_adaln",
        "mode": "per_item_adaln",
        "standard_block_ref": "standard_blocks/per-item-adaln-conditioning.yaml",
        "updates_source": false,
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence",
              "note": "Neutral demo conditioning path."
            }
          ]
        },
        "source": "value_sites.conditioning_signal",
        "target": "modules.item_adaln"
      },
      {
        "id": "group_pair_bias",
        "relation_ref": "relations.pair_context_biases_pair_attention",
        "mode": "pair_bias",
        "updates_source": false,
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence",
              "note": "Neutral demo pair/context bias path."
            }
          ]
        },
        "source": "value_sites.pair_context",
        "target": "modules.pair_biased_attention"
      }
    ],
    "scaleTransitions": [
      {
        "id": "item_to_group_pool",
        "relation_path": [
          "relations.encoded_item_state_enters_group_pool",
          "relations.item_to_group_pool_produces_group_state"
        ],
        "index_relation_ref": "relations.item_to_group_index_guides_pooling",
        "aggregation": "scatter_mean",
        "copy_vs_pool": "pool",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence",
              "note": "Neutral demo compression path."
            }
          ]
        },
        "source": "value_sites.item_state_after_encoder",
        "target": "value_sites.group_state_before_refiner",
        "from_scale": "item",
        "to_scale": "group",
        "projection_refs": [
          "modules.item_to_group_pool"
        ],
        "index_map": "value_sites.item_to_group_index"
      },
      {
        "id": "group_to_item_broadcast",
        "relation_path": [
          "relations.refined_group_state_enters_output_decoder",
          "relations.output_decoder_produces_item_output_state"
        ],
        "index_relation_ref": "relations.item_to_group_index_guides_output_decoder",
        "aggregation": "gather",
        "copy_vs_pool": "copy",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence",
              "note": "Neutral demo broadcast path."
            }
          ]
        },
        "source": "value_sites.group_state_after_refiner",
        "target": "value_sites.item_output_state",
        "from_scale": "group",
        "to_scale": "item",
        "projection_refs": [
          "modules.output_decoder"
        ],
        "index_map": "value_sites.item_to_group_index"
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
      ],
      "evidence": {
        "status": "inferred",
        "refs": [
          {
            "source_ref": "generic_feature_refinement_source",
            "role": "scaffold_evidence",
            "note": "The training and inference fields are deliberately unknown or schematic in this domain-neutral demonstration."
          }
        ]
      }
    },
    "relations": [
      {
        "id": "raw_records_enter_input_adapter",
        "from": "value_sites.raw_records_input",
        "to": "modules.input_adapter",
        "kind": "data_flow",
        "carries": [
          "representations.raw_records"
        ],
        "operation": "embed_inputs",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "input_adapter_initializes_item_state",
        "from": "modules.input_adapter",
        "to": "value_sites.item_state_before_encoder",
        "kind": "data_flow",
        "carries": [
          "representations.item_state"
        ],
        "operation": "initialize_state",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "input_adapter_initializes_conditioning_signal",
        "from": "modules.input_adapter",
        "to": "value_sites.conditioning_signal",
        "kind": "data_flow",
        "carries": [
          "representations.conditioning_signal"
        ],
        "operation": "initialize_conditioning",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "input_adapter_produces_item_to_group_index",
        "from": "modules.input_adapter",
        "to": "value_sites.item_to_group_index",
        "kind": "index_flow",
        "carries": [
          "representations.item_to_group_index"
        ],
        "operation": "assign_group_ownership",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_state_feeds_context_builder",
        "from": "value_sites.item_state_before_encoder",
        "to": "modules.context_builder",
        "kind": "data_flow",
        "carries": [
          "representations.item_state"
        ],
        "operation": "pair_context_construction",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_to_group_index_guides_context_builder",
        "from": "value_sites.item_to_group_index",
        "to": "modules.context_builder",
        "kind": "index_flow",
        "carries": [
          "representations.item_to_group_index"
        ],
        "operation": "group_context_by_ownership",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "context_builder_produces_pair_context",
        "from": "modules.context_builder",
        "to": "value_sites.pair_context",
        "kind": "data_flow",
        "carries": [
          "representations.pair_context"
        ],
        "operation": "build_pair_context",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_state_enters_item_adaln",
        "from": "value_sites.item_state_before_encoder",
        "to": "modules.item_adaln",
        "kind": "data_flow",
        "carries": [
          "representations.item_state"
        ],
        "operation": "normalize_item_state",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "conditioning_signal_modulates_item_adaln",
        "from": "value_sites.conditioning_signal",
        "to": "modules.item_adaln",
        "kind": "conditioning",
        "carries": [
          "representations.conditioning_signal"
        ],
        "operation": "adaptive_conditioning",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_adaln_feeds_local_attention",
        "from": "modules.item_adaln",
        "to": "modules.local_attention_stack",
        "kind": "data_flow",
        "carries": [
          "representations.item_state"
        ],
        "operation": "apply_modulation",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "local_attention_updates_item_state",
        "from": "modules.local_attention_stack",
        "to": "value_sites.item_state_after_encoder",
        "kind": "data_flow",
        "carries": [
          "representations.item_state"
        ],
        "operation": "item_attention_update",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "encoded_item_state_enters_group_pool",
        "from": "value_sites.item_state_after_encoder",
        "to": "modules.item_to_group_pool",
        "kind": "data_flow",
        "carries": [
          "representations.item_state"
        ],
        "operation": "prepare_compression",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_to_group_index_guides_pooling",
        "from": "value_sites.item_to_group_index",
        "to": "modules.item_to_group_pool",
        "kind": "index_flow",
        "carries": [
          "representations.item_to_group_index"
        ],
        "operation": "scatter_by_group_ownership",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_to_group_pool_produces_group_state",
        "from": "modules.item_to_group_pool",
        "to": "value_sites.group_state_before_refiner",
        "kind": "data_flow",
        "carries": [
          "representations.group_state"
        ],
        "operation": "scatter_mean",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "group_state_enters_pair_attention",
        "from": "value_sites.group_state_before_refiner",
        "to": "modules.pair_biased_attention",
        "kind": "data_flow",
        "carries": [
          "representations.group_state"
        ],
        "operation": "project_queries_keys_values",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "pair_context_biases_pair_attention",
        "from": "value_sites.pair_context",
        "to": "modules.pair_biased_attention",
        "kind": "conditioning",
        "carries": [
          "representations.pair_context"
        ],
        "operation": "pair_bias",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "pair_attention_updates_group_state",
        "from": "modules.pair_biased_attention",
        "to": "value_sites.group_state_after_refiner",
        "kind": "data_flow",
        "carries": [
          "representations.group_state"
        ],
        "operation": "group_attention_update",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "refined_group_state_enters_output_decoder",
        "from": "value_sites.group_state_after_refiner",
        "to": "modules.output_decoder",
        "kind": "data_flow",
        "carries": [
          "representations.group_state"
        ],
        "operation": "decode_groups",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "encoded_item_state_skips_to_output_decoder",
        "from": "value_sites.item_state_after_encoder",
        "to": "modules.output_decoder",
        "kind": "skip",
        "carries": [
          "representations.item_state"
        ],
        "operation": "fuse_item_skip",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_to_group_index_guides_output_decoder",
        "from": "value_sites.item_to_group_index",
        "to": "modules.output_decoder",
        "kind": "index_flow",
        "carries": [
          "representations.item_to_group_index"
        ],
        "operation": "gather_by_group_ownership",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "output_decoder_produces_item_output_state",
        "from": "modules.output_decoder",
        "to": "value_sites.item_output_state",
        "kind": "data_flow",
        "carries": [
          "representations.item_output_state"
        ],
        "operation": "broadcast_and_fuse",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "item_output_state_feeds_output_heads",
        "from": "value_sites.item_output_state",
        "to": "modules.output_heads",
        "kind": "data_flow",
        "carries": [
          "representations.item_output_state"
        ],
        "operation": "output_projection",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "output_heads_produce_predictions",
        "from": "modules.output_heads",
        "to": "value_sites.predictions_output",
        "kind": "data_flow",
        "carries": [
          "representations.predictions"
        ],
        "operation": "predict",
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      }
    ],
    "claims": [
      {
        "id": "context_bias_is_read_only",
        "statement": "The pair/context stream is used as attention-logit conditioning in the group refiner and is not updated there.",
        "scope": {
          "module_ref": "modules.group_refiner"
        },
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      },
      {
        "id": "compression_is_explicit",
        "statement": "The item-to-group transition is modeled as pooling, while the group-to-item transition is modeled as broadcast/gather.",
        "scope": {
          "scale_transition": "item_to_group_pool"
        },
        "evidence": {
          "status": "inferred",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence"
            }
          ]
        }
      }
    ],
    "openQuestions": [
      {
        "id": "update_pair_context",
        "question": "Should a concrete architecture update pair/context state or keep it read-only?",
        "status": "unresolved",
        "affected_refs": [
          "state_semantics.pair_context",
          "value_sites.pair_context"
        ],
        "blocking": false,
        "resolution_criteria": "Resolve when this scaffold is specialized to an architecture with explicit pair/context update semantics.",
        "evidence": {
          "status": "open_question",
          "refs": [
            {
              "source_ref": "generic_feature_refinement_source",
              "role": "scaffold_evidence",
              "note": "The generic source intentionally leaves this specialization choice open."
            }
          ]
        }
      }
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
    "pair_biased_attention": {
      "id": "pair_biased_attention",
      "schemaVersion": "standard-block-v0.2",
      "name": "Pair-Biased Attention",
      "sourceYaml": "../../standard_blocks/pair-biased-attention.yaml",
      "description": "Update a single/token stream with self-attention whose logits are conditioned by a pair representation, optionally aggregating pair values and applying an architecture wrapper.",
      "math": [
        {
          "id": "project_qkv",
          "text": "q, k, v = project_qkv(single_state)",
          "tex": "q_i, k_i, v_i = W_{qkv}s_i",
          "operation": "qkv_projection"
        },
        {
          "id": "scalar_logits",
          "text": "scalar_logits = einsum(q, k) * scale",
          "tex": "ell^{qk}_{ijh} = <q_{ih}, k_{jh}> s_h",
          "operation": "attention_logits"
        },
        {
          "id": "project_pair_bias",
          "text": "pair_bias = project_pair(pair_context)",
          "tex": "b_{ijh} = W_h z_{ij}",
          "operation": "pair_bias_projection"
        },
        {
          "id": "combine_logits",
          "text": "biased_logits = scalar_logits + pair_bias",
          "tex": "ell_{ijh} = ell^{qk}_{ijh} + b_{ijh}",
          "operation": "pair_bias_add"
        },
        {
          "id": "apply_attention_mask",
          "text": "masked_logits = biased_logits + mask_bias(attention_mask)",
          "tex": "ell^m_{ijh} = ell_{ijh} + m_{ij}",
          "operation": "attention_mask"
        },
        {
          "id": "softmax_attention_unmasked",
          "text": "attention = softmax(biased_logits, dim=keys)",
          "tex": "a_{ijh} = softmax_j(ell_{ijh})",
          "operation": "softmax"
        },
        {
          "id": "softmax_attention_masked",
          "text": "attention = softmax(masked_logits, dim=keys)",
          "tex": "a_{ijh} = softmax_j(ell^m_{ijh})",
          "operation": "softmax"
        },
        {
          "id": "aggregate_scalar_values",
          "text": "scalar_context = einsum(attention, v)",
          "tex": "o^s_{ih} = sum_j a_{ijh} v_{jh}",
          "operation": "weighted_sum"
        },
        {
          "id": "aggregate_pair_values",
          "text": "pair_context_out = einsum(attention, pair_context)",
          "tex": "o^z_{ih} = sum_j a_{ijh} z_{ij}",
          "operation": "pair_value_aggregation"
        },
        {
          "id": "project_attention_output",
          "text": "updated_single_state = output_projection(scalar_context)",
          "operation": "output_projection"
        },
        {
          "id": "project_reduced_output",
          "text": "attention_delta = output_projection(concat(scalar_context, pair_context_out))",
          "operation": "output_projection"
        },
        {
          "id": "residual_norm",
          "text": "normalized_single = layer_norm(single_state + dropout(attention_delta))",
          "operation": "residual_normalization"
        },
        {
          "id": "transition_and_mask",
          "text": "updated_single_state = transition(normalized_single) * attention_mask",
          "operation": "transition_mask"
        }
      ],
      "kind": "attention",
      "status": "review",
      "ports": [
        {
          "id": "single_state",
          "label": "single state",
          "direction": "input",
          "kind": "representation",
          "required": true,
          "cardinality": "one",
          "relation_kinds": [
            "data_flow",
            "state_update"
          ],
          "glyph": "single",
          "notation": "s",
          "role": "state used to form queries, keys, and scalar values"
        },
        {
          "id": "pair_context",
          "label": "pair context",
          "direction": "conditioning",
          "kind": "representation",
          "required": true,
          "cardinality": "one",
          "relation_kinds": [
            "conditioning",
            "data_flow"
          ],
          "glyph": "pair",
          "notation": "z",
          "role": "read-only pair representation used for logit bias and optional pair values"
        },
        {
          "id": "attention_mask",
          "label": "attention mask",
          "direction": "conditioning",
          "kind": "mask",
          "required": false,
          "cardinality": "one",
          "relation_kinds": [
            "conditioning",
            "control"
          ],
          "glyph": "vector",
          "notation": "m",
          "role": "optional validity mask applied before softmax and after a reduced wrapper"
        },
        {
          "id": "updated_single_state",
          "label": "updated single state",
          "direction": "output",
          "kind": "representation",
          "required": true,
          "cardinality": "one",
          "relation_kinds": [
            "data_flow",
            "state_update"
          ],
          "glyph": "single",
          "notation": "s'",
          "role": "attention-updated single/token stream"
        }
      ],
      "variants": [
        {
          "id": "logit_bias_only",
          "label": "Pair-logit bias",
          "description": "Standard self-attention with a projected pair term added to logits; pair features are not aggregated as values.",
          "step_refs": [
            "steps.project_qkv",
            "steps.scalar_logits",
            "steps.project_pair_bias",
            "steps.combine_logits",
            "steps.softmax_attention_unmasked",
            "steps.aggregate_scalar_values",
            "steps.project_attention_output"
          ]
        },
        {
          "id": "pair_values_residual_norm_transition",
          "label": "Reduced pair attention + wrapper",
          "description": "A reduced IPA-style path adds pair bias, aggregates pair values, then applies residual normalization, a transition, and output masking.",
          "step_refs": [
            "steps.project_qkv",
            "steps.scalar_logits",
            "steps.project_pair_bias",
            "steps.combine_logits",
            "steps.apply_attention_mask",
            "steps.softmax_attention_masked",
            "steps.aggregate_scalar_values",
            "steps.aggregate_pair_values",
            "steps.project_reduced_output",
            "steps.residual_norm",
            "steps.transition_and_mask"
          ]
        }
      ],
      "defaultVariant": "logit_bias_only",
      "values": [
        {
          "id": "queries",
          "label": "queries",
          "kind": "representation",
          "glyph": "single",
          "notation": "Q"
        },
        {
          "id": "keys",
          "label": "keys",
          "kind": "representation",
          "glyph": "single",
          "notation": "K"
        },
        {
          "id": "scalar_values",
          "label": "scalar values",
          "kind": "representation",
          "glyph": "single",
          "notation": "V"
        },
        {
          "id": "scalar_logits",
          "label": "query-key logits",
          "kind": "logit",
          "glyph": "pair",
          "notation": "l_qk"
        },
        {
          "id": "pair_bias",
          "label": "projected pair bias",
          "kind": "logit",
          "glyph": "pair",
          "notation": "b_z"
        },
        {
          "id": "biased_logits",
          "label": "conditioned logits",
          "kind": "logit",
          "glyph": "pair",
          "notation": "l"
        },
        {
          "id": "masked_logits",
          "label": "masked logits",
          "kind": "logit",
          "glyph": "pair",
          "notation": "l_m"
        },
        {
          "id": "attention_weights",
          "label": "attention weights",
          "kind": "weight",
          "glyph": "pair",
          "notation": "a"
        },
        {
          "id": "scalar_context",
          "label": "scalar context",
          "kind": "representation",
          "glyph": "single",
          "notation": "o_s"
        },
        {
          "id": "pair_value_context",
          "label": "pair-value context",
          "kind": "representation",
          "glyph": "single",
          "notation": "o_z"
        },
        {
          "id": "attention_delta",
          "label": "attention delta",
          "kind": "representation",
          "glyph": "single",
          "notation": "delta_s"
        },
        {
          "id": "normalized_single",
          "label": "residual-normalized state",
          "kind": "representation",
          "glyph": "single",
          "notation": "s_norm"
        }
      ],
      "steps": [
        {
          "id": "project_qkv",
          "label": "Project Q, K, and V",
          "operation": "qkv_projection",
          "inputs": [
            "ports.single_state"
          ],
          "outputs": [
            "values.queries",
            "values.keys",
            "values.scalar_values"
          ],
          "code": "q, k, v = project_qkv(single_state)",
          "tex": "q_i, k_i, v_i = W_{qkv}s_i",
          "role": "form self-attention terms from the same single-state input"
        },
        {
          "id": "scalar_logits",
          "label": "Form query-key logits",
          "operation": "attention_logits",
          "inputs": [
            "values.queries",
            "values.keys"
          ],
          "outputs": [
            "values.scalar_logits"
          ],
          "code": "scalar_logits = einsum(q, k) * scale",
          "tex": "ell^{qk}_{ijh} = <q_{ih}, k_{jh}> s_h"
        },
        {
          "id": "project_pair_bias",
          "label": "Project pair bias",
          "operation": "pair_bias_projection",
          "inputs": [
            "ports.pair_context"
          ],
          "outputs": [
            "values.pair_bias"
          ],
          "code": "pair_bias = project_pair(pair_context)",
          "tex": "b_{ijh} = W_h z_{ij}",
          "role": "the selected architecture variant owns any pair preprocessing before projection"
        },
        {
          "id": "combine_logits",
          "label": "Add pair bias",
          "operation": "pair_bias_add",
          "inputs": [
            "values.scalar_logits",
            "values.pair_bias"
          ],
          "outputs": [
            "values.biased_logits"
          ],
          "code": "biased_logits = scalar_logits + pair_bias",
          "tex": "ell_{ijh} = ell^{qk}_{ijh} + b_{ijh}"
        },
        {
          "id": "apply_attention_mask",
          "label": "Apply attention mask",
          "operation": "attention_mask",
          "inputs": [
            "values.biased_logits",
            "ports.attention_mask"
          ],
          "outputs": [
            "values.masked_logits"
          ],
          "code": "masked_logits = biased_logits + mask_bias(attention_mask)",
          "tex": "ell^m_{ijh} = ell_{ijh} + m_{ij}"
        },
        {
          "id": "softmax_attention_unmasked",
          "label": "Normalize attention",
          "operation": "softmax",
          "inputs": [
            "values.biased_logits"
          ],
          "outputs": [
            "values.attention_weights"
          ],
          "code": "attention = softmax(biased_logits, dim=keys)",
          "tex": "a_{ijh} = softmax_j(ell_{ijh})"
        },
        {
          "id": "softmax_attention_masked",
          "label": "Normalize masked attention",
          "operation": "softmax",
          "inputs": [
            "values.masked_logits"
          ],
          "outputs": [
            "values.attention_weights"
          ],
          "code": "attention = softmax(masked_logits, dim=keys)",
          "tex": "a_{ijh} = softmax_j(ell^m_{ijh})"
        },
        {
          "id": "aggregate_scalar_values",
          "label": "Aggregate scalar values",
          "operation": "weighted_sum",
          "inputs": [
            "values.attention_weights",
            "values.scalar_values"
          ],
          "outputs": [
            "values.scalar_context"
          ],
          "code": "scalar_context = einsum(attention, v)",
          "tex": "o^s_{ih} = sum_j a_{ijh} v_{jh}"
        },
        {
          "id": "aggregate_pair_values",
          "label": "Aggregate pair values",
          "operation": "pair_value_aggregation",
          "inputs": [
            "values.attention_weights",
            "ports.pair_context"
          ],
          "outputs": [
            "values.pair_value_context"
          ],
          "code": "pair_context_out = einsum(attention, pair_context)",
          "tex": "o^z_{ih} = sum_j a_{ijh} z_{ij}"
        },
        {
          "id": "project_attention_output",
          "label": "Project attention output",
          "operation": "output_projection",
          "inputs": [
            "values.scalar_context"
          ],
          "outputs": [
            "ports.updated_single_state"
          ],
          "code": "updated_single_state = output_projection(scalar_context)"
        },
        {
          "id": "project_reduced_output",
          "label": "Fuse scalar and pair contexts",
          "operation": "output_projection",
          "inputs": [
            "values.scalar_context",
            "values.pair_value_context"
          ],
          "outputs": [
            "values.attention_delta"
          ],
          "code": "attention_delta = output_projection(concat(scalar_context, pair_context_out))"
        },
        {
          "id": "residual_norm",
          "label": "Residual, dropout, and norm",
          "operation": "residual_normalization",
          "inputs": [
            "ports.single_state",
            "values.attention_delta"
          ],
          "outputs": [
            "values.normalized_single"
          ],
          "code": "normalized_single = layer_norm(single_state + dropout(attention_delta))"
        },
        {
          "id": "transition_and_mask",
          "label": "Transition and mask",
          "operation": "transition_mask",
          "inputs": [
            "values.normalized_single",
            "ports.attention_mask"
          ],
          "outputs": [
            "ports.updated_single_state"
          ],
          "code": "updated_single_state = transition(normalized_single) * attention_mask"
        }
      ],
      "visualTemplate": {
        "grid": {
          "columns": 9,
          "rows": 6,
          "column_sizing": "content",
          "col_gap": 28,
          "row_gap": 24
        },
        "nodes": [
          {
            "id": "single_state",
            "ref": "ports.single_state",
            "col": 1,
            "row": 2,
            "prominence": "secondary",
            "treatment": "compact"
          },
          {
            "id": "pair_context",
            "ref": "ports.pair_context",
            "col": 1,
            "row": 5,
            "prominence": "secondary",
            "treatment": "compact"
          },
          {
            "id": "attention_mask",
            "ref": "ports.attention_mask",
            "col": 3,
            "row": 6,
            "prominence": "context",
            "treatment": "chip"
          },
          {
            "id": "updated_single_state",
            "ref": "ports.updated_single_state",
            "col": 9,
            "row": 2,
            "prominence": "secondary",
            "treatment": "compact"
          },
          {
            "id": "project_qkv",
            "ref": "steps.project_qkv",
            "col": 2,
            "row": 2,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "queries",
            "ref": "values.queries",
            "col": 3,
            "row": 1,
            "prominence": "context",
            "treatment": "chip"
          },
          {
            "id": "keys",
            "ref": "values.keys",
            "col": 3,
            "row": 2,
            "prominence": "context",
            "treatment": "chip"
          },
          {
            "id": "scalar_values",
            "ref": "values.scalar_values",
            "col": 3,
            "row": 3,
            "prominence": "context",
            "treatment": "chip"
          },
          {
            "id": "scalar_logits_step",
            "ref": "steps.scalar_logits",
            "col": 4,
            "row": 2,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "scalar_logits",
            "ref": "values.scalar_logits",
            "col": 5,
            "row": 2,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "project_pair_bias",
            "ref": "steps.project_pair_bias",
            "col": 3,
            "row": 5,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "pair_bias",
            "ref": "values.pair_bias",
            "col": 5,
            "row": 5,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "combine_logits",
            "ref": "steps.combine_logits",
            "col": 6,
            "row": 3,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "biased_logits",
            "ref": "values.biased_logits",
            "col": 7,
            "row": 3,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "apply_attention_mask",
            "ref": "steps.apply_attention_mask",
            "col": 5,
            "row": 6,
            "prominence": "secondary",
            "treatment": "compact"
          },
          {
            "id": "masked_logits",
            "ref": "values.masked_logits",
            "col": 7,
            "row": 6,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "softmax_attention_unmasked",
            "ref": "steps.softmax_attention_unmasked",
            "col": 8,
            "row": 3,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "softmax_attention_masked",
            "ref": "steps.softmax_attention_masked",
            "col": 8,
            "row": 6,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "attention_weights",
            "ref": "values.attention_weights",
            "col": 9,
            "row": 3,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "aggregate_scalar_values",
            "ref": "steps.aggregate_scalar_values",
            "col": 6,
            "row": 1,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "scalar_context",
            "ref": "values.scalar_context",
            "col": 7,
            "row": 1,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "aggregate_pair_values",
            "ref": "steps.aggregate_pair_values",
            "col": 6,
            "row": 5,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "pair_value_context",
            "ref": "values.pair_value_context",
            "col": 7,
            "row": 5,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "project_attention_output",
            "ref": "steps.project_attention_output",
            "col": 8,
            "row": 1,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "project_reduced_output",
            "ref": "steps.project_reduced_output",
            "col": 8,
            "row": 5,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "attention_delta",
            "ref": "values.attention_delta",
            "col": 9,
            "row": 5,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "residual_norm",
            "ref": "steps.residual_norm",
            "col": 7,
            "row": 4,
            "prominence": "primary",
            "treatment": "compact"
          },
          {
            "id": "normalized_single",
            "ref": "values.normalized_single",
            "col": 8,
            "row": 4,
            "prominence": "context",
            "treatment": "compact"
          },
          {
            "id": "transition_and_mask",
            "ref": "steps.transition_and_mask",
            "col": 9,
            "row": 4,
            "prominence": "primary",
            "treatment": "compact"
          }
        ]
      },
      "evidencePolicy": {
        "generic_definition": "The template is reusable algorithm vocabulary, not evidence that a method uses every variant.",
        "usage_requires": [
          "Evidence for the pair projection and addition to attention logits.",
          "Evidence for pair-value aggregation and wrapper operations when the reduced variant is selected."
        ]
      }
    },
    "per_item_adaln_conditioning": {
      "id": "per_item_adaln_conditioning",
      "schemaVersion": "standard-block-v0.1",
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
      "schemaVersion": "standard-block-v0.1",
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
      "schemaVersion": "pseudocode-v0.1",
      "compilerVersion": "semantic-pseudocode-compiler-v0.3",
      "id": "generic_feature_refinement",
      "title": "Generic Feature Refinement Trace",
      "sources": [
        {
          "id": "demo_source",
          "source_ref": "generic_feature_refinement_source"
        }
      ],
      "scopes": [

      ],
      "symbols": [
        {
          "id": "raw_records",
          "name": "raw_records",
          "type": "input",
          "shape": "B x N_item x input_fields",
          "representationRef": "representations.raw_records",
          "scale": "item",
          "architectureRef": "representations.raw_records"
        },
        {
          "id": "item_state",
          "name": "x",
          "type": "representation",
          "shape": "B x N_item x d_item",
          "representationRef": "representations.item_state",
          "scale": "item",
          "architectureRef": "representations.item_state"
        },
        {
          "id": "conditioning_signal",
          "name": "s",
          "type": "representation",
          "shape": "B x N_item x d_cond",
          "representationRef": "representations.conditioning_signal",
          "scale": "item",
          "architectureRef": "representations.conditioning_signal"
        },
        {
          "id": "pair_context",
          "name": "c",
          "type": "representation",
          "shape": "B x N_group x N_group x d_pair",
          "representationRef": "representations.pair_context",
          "scale": "item_pair",
          "architectureRef": "representations.pair_context"
        },
        {
          "id": "group_state",
          "name": "g",
          "type": "representation",
          "shape": "B x N_group x d_group",
          "representationRef": "representations.group_state",
          "scale": "group",
          "architectureRef": "representations.group_state"
        },
        {
          "id": "item_output_state",
          "name": "o",
          "type": "representation",
          "shape": "B x N_item x d_out",
          "representationRef": "representations.item_output_state",
          "scale": "item",
          "architectureRef": "representations.item_output_state"
        },
        {
          "id": "predictions",
          "name": "y",
          "type": "output",
          "shape": "B x N_item x output_fields",
          "representationRef": "representations.predictions",
          "scale": "output",
          "architectureRef": "representations.predictions"
        }
      ],
      "lines": [
        {
          "id": "adapt_inputs",
          "text": "x, s, item_to_group = InputAdapter(raw_records)",
          "refs": "input_adapter",
          "sourceRefs": [
            {
              "source": "demo_source",
              "locator": "input_adapter"
            }
          ],
          "architectureRefs": [
            "modules.input_adapter"
          ],
          "operation": "embed_inputs",
          "inputs": [
            "raw_records"
          ],
          "outputs": [
            "item_state",
            "conditioning_signal"
          ]
        },
        {
          "id": "build_context",
          "text": "c = ContextBuilder(x, item_to_group)",
          "refs": "context_builder",
          "sourceRefs": [
            {
              "source": "demo_source",
              "locator": "context_builder"
            }
          ],
          "architectureRefs": [
            "modules.context_builder",
            "representations.pair_context"
          ],
          "operation": "build_pair_context",
          "inputs": [
            "item_state"
          ],
          "outputs": [
            "pair_context"
          ]
        },
        {
          "id": "item_adaln",
          "text": "x = ItemEncoder(x, cond=s)",
          "refs": "item_encoder",
          "sourceRefs": [
            {
              "source": "demo_source",
              "locator": "item_encoder"
            }
          ],
          "architectureRefs": [
            "modules.item_encoder"
          ],
          "standardBlockRef": "../../standard_blocks/per-item-adaln-conditioning.yaml",
          "operation": "per_item_adaln",
          "inputs": [
            "item_state",
            "conditioning_signal"
          ],
          "outputs": [
            "item_state"
          ],
          "visual": {
            "block": "per_item_adaln_conditioning",
            "slots": {
              "item_state": "item_state",
              "conditioning_signal": "conditioning_signal"
            }
          }
        },
        {
          "id": "pool_groups",
          "text": "g = scatter_mean(Project(x), item_to_group)",
          "refs": "item_to_group_pool",
          "sourceRefs": [
            {
              "source": "demo_source",
              "locator": "item_to_group_pool"
            }
          ],
          "architectureRefs": [
            "modules.item_to_group_pool",
            "representations.group_state"
          ],
          "operation": "scatter_mean",
          "inputs": [
            "item_state"
          ],
          "outputs": [
            "group_state"
          ]
        },
        {
          "id": "pair_bias_refine",
          "text": "g = GroupRefiner(g, pair_bias=Linear(LayerNorm(c)))",
          "refs": "group_refiner",
          "sourceRefs": [
            {
              "source": "demo_source",
              "locator": "group_refiner"
            }
          ],
          "architectureRefs": [
            "modules.group_refiner",
            "claims.context_bias_is_read_only"
          ],
          "blockInstanceRef": "block_instances.generic_group_pair_attention",
          "operation": "pair_bias_add",
          "inputs": [
            "group_state",
            "pair_context"
          ],
          "outputs": [
            "group_state"
          ]
        },
        {
          "id": "broadcast_groups",
          "text": "o = OutputDecoder(gather(g, item_to_group), skip=x)",
          "refs": "output_decoder",
          "sourceRefs": [
            {
              "source": "demo_source",
              "locator": "output_decoder"
            }
          ],
          "architectureRefs": [
            "modules.output_decoder",
            "claims.compression_is_explicit"
          ],
          "operation": "gather",
          "inputs": [
            "group_state",
            "item_state"
          ],
          "outputs": [
            "item_output_state"
          ]
        },
        {
          "id": "predict",
          "text": "y = OutputHeads(o)",
          "refs": "output_heads",
          "sourceRefs": [
            {
              "source": "demo_source",
              "locator": "output_heads"
            }
          ],
          "architectureRefs": [
            "modules.output_heads"
          ],
          "operation": "output_projection",
          "inputs": [
            "item_output_state"
          ],
          "outputs": [
            "predictions"
          ]
        }
      ],
      "claims": [
        {
          "id": "pair_context_read_only_in_refiner",
          "statement": "The pair/context tensor is used as pair bias inside the refiner and is not returned as updated state.",
          "line_refs": [
            "pair_bias_refine"
          ],
          "evidence": {
            "status": "inferred",
            "refs": [
              {
                "source_ref": "generic_feature_refinement_source",
                "role": "scaffold_evidence"
              }
            ]
          }
        },
        {
          "id": "pool_then_broadcast",
          "statement": "Compression and broadcast are separate transitions; they should not be described as a reshape.",
          "line_refs": [
            "pool_groups",
            "broadcast_groups"
          ],
          "evidence": {
            "status": "inferred",
            "refs": [
              {
                "source_ref": "generic_feature_refinement_source",
                "role": "scaffold_evidence"
              }
            ]
          }
        }
      ],
      "sourceYaml": "../../pseudocode/generic-feature-refinement.yaml"
    }
  },
  "boards": {
    "schemaVersion": "visualization-v0.4",
    "sourceYaml": "../../views/generic-semantic-zoom.view.yaml",
    "rootBoard": "refinement_pipeline",
    "items": [
      {
        "id": "refinement_pipeline",
        "title": "Feature Refinement Pipeline",
        "summary": "The pipeline embeds records, updates item states, compresses them to group states, refines groups with pair/context bias, then broadcasts back to item outputs.",
        "subject_ref": "architecture",
        "expansion_depth": 1,
        "grid": {
          "columns": 7,
          "rows": 5
        },
        "nodes": [
          {
            "id": "raw_records",
            "ref": "value_sites.raw_records_input",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 3
          },
          {
            "id": "input_adapter",
            "ref": "modules.input_adapter",
            "prominence": "primary",
            "treatment": "block",
            "col": 2,
            "row": 3
          },
          {
            "id": "conditioning_signal",
            "ref": "value_sites.conditioning_signal",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 1
          },
          {
            "id": "item_state",
            "ref": "value_sites.item_state_before_encoder",
            "label": "item state",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 3
          },
          {
            "id": "context_builder",
            "ref": "modules.context_builder",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 2
          },
          {
            "id": "pair_context",
            "ref": "value_sites.pair_context",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 1
          },
          {
            "id": "item_encoder",
            "ref": "modules.item_encoder",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 3,
            "board_ref": "item_encoder"
          },
          {
            "id": "item_to_group_pool",
            "ref": "modules.item_to_group_pool",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 3
          },
          {
            "id": "group_state",
            "ref": "value_sites.group_state_before_refiner",
            "label": "group state",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 2
          },
          {
            "id": "group_refiner",
            "ref": "modules.group_refiner",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 2,
            "board_ref": "group_refiner"
          },
          {
            "id": "output_decoder",
            "ref": "modules.output_decoder",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 4
          },
          {
            "id": "item_output_state",
            "ref": "value_sites.item_output_state",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 4
          },
          {
            "id": "output_heads",
            "ref": "modules.output_heads",
            "prominence": "primary",
            "treatment": "compact",
            "density": "compact",
            "col": 7,
            "row": 3
          },
          {
            "id": "predictions",
            "ref": "value_sites.predictions_output",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 7,
            "row": 2
          }
        ],
        "elide": [
          {
            "ref": "value_sites.item_to_group_index"
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.raw_records_enter_input_adapter"
            },
            "label": "fields",
            "connection": {
              "title": "Raw records to adapter",
              "role": "input embedding",
              "inside": "The adapter turns raw fields into latent item state, conditioning, masks, and grouping indices."
            }
          },
          {
            "match": {
              "relation_ref": "relations.input_adapter_initializes_item_state"
            },
            "label": "item state",
            "connection": {
              "title": "Adapter initializes item state",
              "role": "mutable fine-scale state",
              "inside": "The item stream is the fine-resolution state updated by the item encoder."
            }
          },
          {
            "match": {
              "relation_ref": "relations.input_adapter_initializes_conditioning_signal"
            },
            "label": "cond",
            "tone": "conditioning",
            "connection": {
              "title": "Adapter builds conditioning",
              "role": "adaptive modulation source",
              "inside": "The conditioning signal is carried separately so item updates can be modulated without replacing item state."
            }
          },
          {
            "match": {
              "relation_ref": "relations.item_state_feeds_context_builder"
            },
            "label": "context feats",
            "connection": {
              "title": "Item features to context builder",
              "role": "pair/context construction",
              "inside": "The context builder summarizes relationships that later bias group attention."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.input_adapter_produces_item_to_group_index",
                "relations.item_to_group_index_guides_context_builder"
              ]
            },
            "label": "grouping index",
            "route_side": "top",
            "route_clearance": 24,
            "connection": {
              "title": "Group ownership to context builder",
              "role": "indexed context construction",
              "inside": "The context builder uses the ownership map to organize item relationships at group resolution."
            }
          },
          {
            "match": {
              "relation_ref": "relations.context_builder_produces_pair_context"
            },
            "label": "C_ij",
            "tone": "conditioning",
            "connection": {
              "title": "Pair/context state",
              "role": "attention bias source",
              "inside": "Pair/context features are retained as read-only conditioning for the group refiner in this demo."
            }
          },
          {
            "match": {
              "relation_ref": "relations.item_state_enters_item_adaln"
            },
            "label": "x_i",
            "connection": {
              "title": "Item state into encoder",
              "role": "local mutable state",
              "inside": "The item encoder applies local attention and feedforward updates to the item stream."
            }
          },
          {
            "match": {
              "relation_ref": "relations.conditioning_signal_modulates_item_adaln"
            },
            "label": "cond",
            "tone": "conditioning",
            "connection": {
              "title": "Per-item adaptive modulation",
              "role": "conditioning inside item blocks",
              "inside": "Each item receives conditioning-derived shift, scale, and gate terms before the update."
            }
          },
          {
            "match": {
              "relation_ref": "relations.encoded_item_state_enters_group_pool"
            },
            "label": "updated items",
            "connection": {
              "title": "Item encoder to compression",
              "role": "prepare coarse state",
              "inside": "Updated item states are grouped by an ownership index and projected before pooling."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.input_adapter_produces_item_to_group_index",
                "relations.item_to_group_index_guides_pooling"
              ]
            },
            "label": "grouping index",
            "route_side": "bottom",
            "route_clearance": 24,
            "connection": {
              "title": "Ownership index to compression",
              "role": "scatter assignment",
              "inside": "The pool uses the ownership index to assign each fine item to its coarse group before aggregation."
            }
          },
          {
            "match": {
              "relation_ref": "relations.item_to_group_pool_produces_group_state"
            },
            "label": "pool",
            "connection": {
              "title": "Item-to-group compression",
              "role": "pooling transition",
              "inside": "Multiple item states can contribute to one group state, so this is a compression rather than a reshape."
            }
          },
          {
            "match": {
              "relation_ref": "relations.group_state_enters_pair_attention"
            },
            "label": "g_a",
            "connection": {
              "title": "Group state into refiner",
              "role": "coarse mutable state",
              "inside": "The refiner updates compressed group states with full attention."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_context_biases_pair_attention"
            },
            "label": "bias",
            "tone": "conditioning",
            "connection": {
              "title": "Pair/context bias",
              "role": "attention-logit conditioning",
              "inside": "Pair/context features are projected to per-head logits and added to group attention scores."
            }
          },
          {
            "match": {
              "relation_ref": "relations.refined_group_state_enters_output_decoder"
            },
            "label": "refined groups",
            "connection": {
              "title": "Refined groups to decoder",
              "role": "coarse-to-fine decoding",
              "inside": "The decoder broadcasts refined group state back to item resolution using the same ownership index."
            }
          },
          {
            "match": {
              "relation_ref": "relations.encoded_item_state_skips_to_output_decoder"
            },
            "label": "item skip",
            "tone": "skip",
            "route_side": "bottom",
            "route_clearance": 40,
            "connection": {
              "title": "Fine item skip into decoder",
              "role": "fine-resolution fusion",
              "inside": "The decoder fuses the encoded item stream with gathered group context so fine detail is not reconstructed from groups alone."
            }
          },
          {
            "match": {
              "relation_path": [
                "relations.input_adapter_produces_item_to_group_index",
                "relations.item_to_group_index_guides_output_decoder"
              ]
            },
            "label": "gather index",
            "route_side": "bottom",
            "route_clearance": 72,
            "connection": {
              "title": "Ownership index to decoder",
              "role": "group-to-item gather",
              "inside": "The decoder uses the same ownership map to gather each refined group state back to its member items."
            }
          },
          {
            "match": {
              "relation_ref": "relations.output_decoder_produces_item_output_state"
            },
            "label": "broadcast",
            "connection": {
              "title": "Group-to-item broadcast",
              "role": "gather transition",
              "inside": "Each item receives the state of its owning group; this copies/broadcasts rather than pools."
            }
          },
          {
            "match": {
              "relation_ref": "relations.item_output_state_feeds_output_heads"
            },
            "label": "decoded items",
            "connection": {
              "title": "Decoded state into heads",
              "role": "output projection",
              "inside": "Output heads map item-scale decoded state to task-specific predictions."
            }
          },
          {
            "match": {
              "relation_ref": "relations.output_heads_produce_predictions"
            },
            "label": "y",
            "connection": {
              "title": "Predictions",
              "role": "final outputs",
              "inside": "The output representation is intentionally generic and can be specialized by a concrete architecture."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_5daea4023118",
            "from": "conditioning_signal",
            "to": "item_encoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.conditioning_signal_modulates_item_adaln"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.conditioning_signal_modulates_item_adaln"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.conditioning_signal"
            ],
            "presentation": {
              "label": "cond",
              "tone": "conditioning",
              "connection": {
                "title": "Per-item adaptive modulation",
                "role": "conditioning inside item blocks",
                "inside": "Each item receives conditioning-derived shift, scale, and gate terms before the update."
              }
            }
          },
          {
            "id": "projection_234c113ec811",
            "from": "context_builder",
            "to": "pair_context",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.context_builder_produces_pair_context"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.context_builder_produces_pair_context"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_context"
            ],
            "presentation": {
              "label": "C_ij",
              "tone": "conditioning",
              "connection": {
                "title": "Pair/context state",
                "role": "attention bias source",
                "inside": "Pair/context features are retained as read-only conditioning for the group refiner in this demo."
              }
            }
          },
          {
            "id": "projection_fccd7ef91604",
            "from": "group_refiner",
            "to": "output_decoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.refined_group_state_enters_output_decoder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.refined_group_state_enters_output_decoder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.group_state"
            ],
            "presentation": {
              "label": "refined groups",
              "connection": {
                "title": "Refined groups to decoder",
                "role": "coarse-to-fine decoding",
                "inside": "The decoder broadcasts refined group state back to item resolution using the same ownership index."
              }
            }
          },
          {
            "id": "projection_1790beed0e12",
            "from": "group_state",
            "to": "group_refiner",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.group_state_enters_pair_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.group_state_enters_pair_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.group_state"
            ],
            "presentation": {
              "label": "g_a",
              "connection": {
                "title": "Group state into refiner",
                "role": "coarse mutable state",
                "inside": "The refiner updates compressed group states with full attention."
              }
            }
          },
          {
            "id": "projection_9caf61360c09",
            "from": "input_adapter",
            "to": "conditioning_signal",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.input_adapter_initializes_conditioning_signal"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_adapter_initializes_conditioning_signal"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.conditioning_signal"
            ],
            "presentation": {
              "label": "cond",
              "tone": "conditioning",
              "connection": {
                "title": "Adapter builds conditioning",
                "role": "adaptive modulation source",
                "inside": "The conditioning signal is carried separately so item updates can be modulated without replacing item state."
              }
            }
          },
          {
            "id": "projection_a53bf6e42434",
            "from": "input_adapter",
            "to": "context_builder",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "index_flow",
            "relation_path": [
              "relations.input_adapter_produces_item_to_group_index",
              "relations.item_to_group_index_guides_context_builder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_adapter_produces_item_to_group_index"
              },
              {
                "relation_ref": "relations.item_to_group_index_guides_context_builder"
              }
            ],
            "hidden_refs": [
              "value_sites.item_to_group_index"
            ],
            "carries": [
              "representations.item_to_group_index"
            ],
            "presentation": {
              "label": "grouping index",
              "route_side": "top",
              "route_clearance": 24,
              "connection": {
                "title": "Group ownership to context builder",
                "role": "indexed context construction",
                "inside": "The context builder uses the ownership map to organize item relationships at group resolution."
              }
            }
          },
          {
            "id": "projection_bb394ec87985",
            "from": "input_adapter",
            "to": "item_state",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.input_adapter_initializes_item_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_adapter_initializes_item_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.item_state"
            ],
            "presentation": {
              "label": "item state",
              "connection": {
                "title": "Adapter initializes item state",
                "role": "mutable fine-scale state",
                "inside": "The item stream is the fine-resolution state updated by the item encoder."
              }
            }
          },
          {
            "id": "projection_73eb1e12ea16",
            "from": "input_adapter",
            "to": "item_to_group_pool",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "index_flow",
            "relation_path": [
              "relations.input_adapter_produces_item_to_group_index",
              "relations.item_to_group_index_guides_pooling"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_adapter_produces_item_to_group_index"
              },
              {
                "relation_ref": "relations.item_to_group_index_guides_pooling"
              }
            ],
            "hidden_refs": [
              "value_sites.item_to_group_index"
            ],
            "carries": [
              "representations.item_to_group_index"
            ],
            "presentation": {
              "label": "grouping index",
              "route_side": "bottom",
              "route_clearance": 24,
              "connection": {
                "title": "Ownership index to compression",
                "role": "scatter assignment",
                "inside": "The pool uses the ownership index to assign each fine item to its coarse group before aggregation."
              }
            }
          },
          {
            "id": "projection_dc4a97e6175d",
            "from": "input_adapter",
            "to": "output_decoder",
            "projection": "contracted",
            "origin": "canonical",
            "kind": "index_flow",
            "relation_path": [
              "relations.input_adapter_produces_item_to_group_index",
              "relations.item_to_group_index_guides_output_decoder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.input_adapter_produces_item_to_group_index"
              },
              {
                "relation_ref": "relations.item_to_group_index_guides_output_decoder"
              }
            ],
            "hidden_refs": [
              "value_sites.item_to_group_index"
            ],
            "carries": [
              "representations.item_to_group_index"
            ],
            "presentation": {
              "label": "gather index",
              "route_side": "bottom",
              "route_clearance": 72,
              "connection": {
                "title": "Ownership index to decoder",
                "role": "group-to-item gather",
                "inside": "The decoder uses the same ownership map to gather each refined group state back to its member items."
              }
            }
          },
          {
            "id": "projection_000292a1a00c",
            "from": "item_encoder",
            "to": "item_to_group_pool",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.encoded_item_state_enters_group_pool"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.encoded_item_state_enters_group_pool"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.item_state"
            ],
            "presentation": {
              "label": "updated items",
              "connection": {
                "title": "Item encoder to compression",
                "role": "prepare coarse state",
                "inside": "Updated item states are grouped by an ownership index and projected before pooling."
              }
            }
          },
          {
            "id": "projection_a5973b1e7d85",
            "from": "item_encoder",
            "to": "output_decoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "skip",
            "relation_path": [
              "relations.encoded_item_state_skips_to_output_decoder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.encoded_item_state_skips_to_output_decoder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.item_state"
            ],
            "presentation": {
              "label": "item skip",
              "tone": "skip",
              "route_side": "bottom",
              "route_clearance": 40,
              "connection": {
                "title": "Fine item skip into decoder",
                "role": "fine-resolution fusion",
                "inside": "The decoder fuses the encoded item stream with gathered group context so fine detail is not reconstructed from groups alone."
              }
            }
          },
          {
            "id": "projection_4d9180ef9048",
            "from": "item_output_state",
            "to": "output_heads",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.item_output_state_feeds_output_heads"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.item_output_state_feeds_output_heads"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.item_output_state"
            ],
            "presentation": {
              "label": "decoded items",
              "connection": {
                "title": "Decoded state into heads",
                "role": "output projection",
                "inside": "Output heads map item-scale decoded state to task-specific predictions."
              }
            }
          },
          {
            "id": "projection_619b99df26f6",
            "from": "item_state",
            "to": "context_builder",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.item_state_feeds_context_builder"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.item_state_feeds_context_builder"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.item_state"
            ],
            "presentation": {
              "label": "context feats",
              "connection": {
                "title": "Item features to context builder",
                "role": "pair/context construction",
                "inside": "The context builder summarizes relationships that later bias group attention."
              }
            }
          },
          {
            "id": "projection_a8bba946afb5",
            "from": "item_state",
            "to": "item_encoder",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.item_state_enters_item_adaln"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.item_state_enters_item_adaln"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.item_state"
            ],
            "presentation": {
              "label": "x_i",
              "connection": {
                "title": "Item state into encoder",
                "role": "local mutable state",
                "inside": "The item encoder applies local attention and feedforward updates to the item stream."
              }
            }
          },
          {
            "id": "projection_deeb310b2f84",
            "from": "item_to_group_pool",
            "to": "group_state",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.item_to_group_pool_produces_group_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.item_to_group_pool_produces_group_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.group_state"
            ],
            "presentation": {
              "label": "pool",
              "connection": {
                "title": "Item-to-group compression",
                "role": "pooling transition",
                "inside": "Multiple item states can contribute to one group state, so this is a compression rather than a reshape."
              }
            }
          },
          {
            "id": "projection_cd6da45e4fcc",
            "from": "output_decoder",
            "to": "item_output_state",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.output_decoder_produces_item_output_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.output_decoder_produces_item_output_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.item_output_state"
            ],
            "presentation": {
              "label": "broadcast",
              "connection": {
                "title": "Group-to-item broadcast",
                "role": "gather transition",
                "inside": "Each item receives the state of its owning group; this copies/broadcasts rather than pools."
              }
            }
          },
          {
            "id": "projection_c3b679780211",
            "from": "output_heads",
            "to": "predictions",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.output_heads_produce_predictions"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.output_heads_produce_predictions"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.predictions"
            ],
            "presentation": {
              "label": "y",
              "connection": {
                "title": "Predictions",
                "role": "final outputs",
                "inside": "The output representation is intentionally generic and can be specialized by a concrete architecture."
              }
            }
          },
          {
            "id": "projection_08ef3f65ea1f",
            "from": "pair_context",
            "to": "group_refiner",
            "projection": "boundary",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_context_biases_pair_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_context_biases_pair_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_context"
            ],
            "presentation": {
              "label": "bias",
              "tone": "conditioning",
              "connection": {
                "title": "Pair/context bias",
                "role": "attention-logit conditioning",
                "inside": "Pair/context features are projected to per-head logits and added to group attention scores."
              }
            }
          },
          {
            "id": "projection_8119ea26bc55",
            "from": "raw_records",
            "to": "input_adapter",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.raw_records_enter_input_adapter"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.raw_records_enter_input_adapter"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.raw_records"
            ],
            "presentation": {
              "label": "fields",
              "connection": {
                "title": "Raw records to adapter",
                "role": "input embedding",
                "inside": "The adapter turns raw fields into latent item state, conditioning, masks, and grouping indices."
              }
            }
          }
        ],
        "classifications": {
          "modules.context_builder": "visible",
          "modules.group_refiner": "visible",
          "modules.input_adapter": "visible",
          "modules.item_adaln": "collapsed:modules.item_encoder",
          "modules.item_encoder": "visible",
          "modules.item_to_group_pool": "visible",
          "modules.local_attention_stack": "collapsed:modules.item_encoder",
          "modules.output_decoder": "visible",
          "modules.output_heads": "visible",
          "modules.pair_biased_attention": "collapsed:modules.group_refiner",
          "value_sites.conditioning_signal": "visible",
          "value_sites.group_state_after_refiner": "collapsed:modules.group_refiner",
          "value_sites.group_state_before_refiner": "visible",
          "value_sites.item_output_state": "visible",
          "value_sites.item_state_after_encoder": "collapsed:modules.item_encoder",
          "value_sites.item_state_before_encoder": "visible",
          "value_sites.item_to_group_index": "elided",
          "value_sites.pair_context": "visible",
          "value_sites.predictions_output": "visible",
          "value_sites.raw_records_input": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "item_encoder",
        "title": "Item Encoder",
        "summary": "The item encoder is a local fine-scale stack conditioned by a per-item modulation stream.",
        "parent": "refinement_pipeline",
        "subject_ref": "modules.item_encoder",
        "expansion_depth": 1,
        "grid": {
          "columns": 5,
          "rows": 4
        },
        "nodes": [
          {
            "id": "item_state_in",
            "ref": "value_sites.item_state_before_encoder",
            "label": "item state in",
            "col": 1,
            "row": 2
          },
          {
            "id": "conditioning_signal",
            "ref": "value_sites.conditioning_signal",
            "col": 2,
            "row": 1
          },
          {
            "id": "adaln",
            "ref": "modules.item_adaln",
            "label": "per-item AdaLN",
            "col": 2,
            "row": 2
          },
          {
            "id": "local_attention",
            "ref": "modules.local_attention_stack",
            "label": "local attention stack",
            "col": 3,
            "row": 2
          },
          {
            "id": "item_state_out",
            "ref": "value_sites.item_state_after_encoder",
            "label": "item state out",
            "col": 4,
            "row": 2
          }
        ],
        "exclude": [
          {
            "ref": "modules.item_to_group_pool",
            "reason": "This child board stops at the encoder output before group compression."
          },
          {
            "ref": "modules.output_decoder",
            "reason": "The decoder consumes the item skip on the parent pipeline board."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.item_state_enters_item_adaln"
            },
            "label": "x_i",
            "connection": {
              "title": "Normalize item state",
              "role": "block input",
              "inside": "Item state is normalized before receiving conditioning-derived modulation."
            }
          },
          {
            "match": {
              "relation_ref": "relations.conditioning_signal_modulates_item_adaln"
            },
            "label": "shift/scale/gate",
            "tone": "conditioning",
            "connection": {
              "title": "Per-item modulation",
              "role": "adaptive conditioning",
              "inside": "The conditioning stream is projected independently at each item position."
            }
          },
          {
            "match": {
              "relation_ref": "relations.item_adaln_feeds_local_attention"
            },
            "label": "modulated x",
            "connection": {
              "title": "Modulated item state",
              "role": "attention input",
              "inside": "The modulated stream is fed into the local attention and feedforward update."
            }
          },
          {
            "match": {
              "relation_ref": "relations.local_attention_updates_item_state"
            },
            "label": "x'_i",
            "connection": {
              "title": "Updated item state",
              "role": "mutable output",
              "inside": "The stack returns an item-scale state with the same ownership layout."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_062eedc52486",
            "from": "adaln",
            "to": "local_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.item_adaln_feeds_local_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.item_adaln_feeds_local_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.item_state"
            ],
            "presentation": {
              "label": "modulated x",
              "connection": {
                "title": "Modulated item state",
                "role": "attention input",
                "inside": "The modulated stream is fed into the local attention and feedforward update."
              }
            }
          },
          {
            "id": "projection_e2e42a71c1ce",
            "from": "conditioning_signal",
            "to": "adaln",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.conditioning_signal_modulates_item_adaln"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.conditioning_signal_modulates_item_adaln"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.conditioning_signal"
            ],
            "presentation": {
              "label": "shift/scale/gate",
              "tone": "conditioning",
              "connection": {
                "title": "Per-item modulation",
                "role": "adaptive conditioning",
                "inside": "The conditioning stream is projected independently at each item position."
              }
            }
          },
          {
            "id": "projection_442e8ea32aeb",
            "from": "item_state_in",
            "to": "adaln",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.item_state_enters_item_adaln"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.item_state_enters_item_adaln"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.item_state"
            ],
            "presentation": {
              "label": "x_i",
              "connection": {
                "title": "Normalize item state",
                "role": "block input",
                "inside": "Item state is normalized before receiving conditioning-derived modulation."
              }
            }
          },
          {
            "id": "projection_d7566f9cacc1",
            "from": "local_attention",
            "to": "item_state_out",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.local_attention_updates_item_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.local_attention_updates_item_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.item_state"
            ],
            "presentation": {
              "label": "x'_i",
              "connection": {
                "title": "Updated item state",
                "role": "mutable output",
                "inside": "The stack returns an item-scale state with the same ownership layout."
              }
            }
          }
        ],
        "classifications": {
          "modules.item_adaln": "visible",
          "modules.item_to_group_pool": "excluded",
          "modules.local_attention_stack": "visible",
          "modules.output_decoder": "excluded",
          "value_sites.conditioning_signal": "visible",
          "value_sites.group_state_before_refiner": "excluded",
          "value_sites.item_output_state": "excluded",
          "value_sites.item_state_after_encoder": "visible",
          "value_sites.item_state_before_encoder": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "group_refiner",
        "title": "Group Refiner",
        "summary": "The group refiner updates compressed group states with pair/context-biased full attention.",
        "parent": "refinement_pipeline",
        "subject_ref": "modules.group_refiner",
        "expansion_depth": 1,
        "grid": {
          "columns": 5,
          "rows": 4
        },
        "nodes": [
          {
            "id": "group_state_in",
            "ref": "value_sites.group_state_before_refiner",
            "label": "group state in",
            "col": 1,
            "row": 2
          },
          {
            "id": "pair_context",
            "ref": "value_sites.pair_context",
            "col": 2,
            "row": 1
          },
          {
            "id": "pair_biased_attention",
            "ref": "modules.pair_biased_attention",
            "label": "pair-biased attention",
            "col": 3,
            "row": 2,
            "board_ref": "generic_group_pair_attention_internals"
          },
          {
            "id": "group_state_out",
            "ref": "value_sites.group_state_after_refiner",
            "label": "group state out",
            "col": 4,
            "row": 2
          }
        ],
        "exclude": [
          {
            "ref": "modules.output_decoder",
            "reason": "This child board stops at the refiner output before coarse-to-fine decoding."
          }
        ],
        "edge_overrides": [
          {
            "match": {
              "relation_ref": "relations.group_state_enters_pair_attention"
            },
            "label": "Q/K/V",
            "connection": {
              "title": "Group state as attention stream",
              "role": "mutable state",
              "inside": "Group state supplies query, key, and value projections."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_context_biases_pair_attention"
            },
            "label": "bias",
            "tone": "conditioning",
            "connection": {
              "title": "Pair/context to logits",
              "role": "attention-logit bias",
              "inside": "Pair/context features are projected to bias terms and added before softmax."
            }
          },
          {
            "match": {
              "relation_ref": "relations.pair_attention_updates_group_state"
            },
            "label": "update",
            "connection": {
              "title": "Refined group state",
              "role": "mutable output",
              "inside": "The attention output updates group state while pair/context remains read-only in this demo."
            }
          }
        ],
        "projection_mode": "derived",
        "edges": [
          {
            "id": "projection_91d7d90db4d5",
            "from": "group_state_in",
            "to": "pair_biased_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.group_state_enters_pair_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.group_state_enters_pair_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.group_state"
            ],
            "presentation": {
              "label": "Q/K/V",
              "connection": {
                "title": "Group state as attention stream",
                "role": "mutable state",
                "inside": "Group state supplies query, key, and value projections."
              }
            }
          },
          {
            "id": "projection_63955047456a",
            "from": "pair_biased_attention",
            "to": "group_state_out",
            "projection": "direct",
            "origin": "canonical",
            "kind": "data_flow",
            "relation_path": [
              "relations.pair_attention_updates_group_state"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_attention_updates_group_state"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.group_state"
            ],
            "presentation": {
              "label": "update",
              "connection": {
                "title": "Refined group state",
                "role": "mutable output",
                "inside": "The attention output updates group state while pair/context remains read-only in this demo."
              }
            }
          },
          {
            "id": "projection_e1da8b90261f",
            "from": "pair_context",
            "to": "pair_biased_attention",
            "projection": "direct",
            "origin": "canonical",
            "kind": "conditioning",
            "relation_path": [
              "relations.pair_context_biases_pair_attention"
            ],
            "provenance_hops": [
              {
                "relation_ref": "relations.pair_context_biases_pair_attention"
              }
            ],
            "hidden_refs": [

            ],
            "carries": [
              "representations.pair_context"
            ],
            "presentation": {
              "label": "bias",
              "tone": "conditioning",
              "connection": {
                "title": "Pair/context to logits",
                "role": "attention-logit bias",
                "inside": "Pair/context features are projected to bias terms and added before softmax."
              }
            }
          }
        ],
        "classifications": {
          "modules.output_decoder": "excluded",
          "modules.pair_biased_attention": "visible",
          "value_sites.group_state_after_refiner": "visible",
          "value_sites.group_state_before_refiner": "visible",
          "value_sites.item_output_state": "excluded",
          "value_sites.pair_context": "visible"
        },
        "projectionMode": "derived"
      },
      {
        "id": "generic_group_pair_attention_internals",
        "kind": "standard_block_instance",
        "title": "Pair-Biased Attention Internals",
        "summary": "The reusable logit-bias-only variant projects pair context into the attention logits, then aggregates scalar values into the updated group state.",
        "parent": "group_refiner",
        "subject_ref": "modules.pair_biased_attention",
        "expansion_depth": 0,
        "block_instance_ref": "block_instances.generic_group_pair_attention",
        "grid": {
          "columns": 9,
          "rows": 6,
          "column_sizing": "content",
          "col_gap": 28,
          "row_gap": 24
        },
        "nodes": [
          {
            "id": "single_state",
            "label": "single state",
            "role": "state used to form queries, keys, and scalar values",
            "col": 1,
            "row": 2,
            "prominence": "secondary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.ports.single_state",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.ports.single_state",
            "kind": "representation",
            "rep_ref": "group_state",
            "shape": "B x N_group x d_group",
            "scale": "group",
            "glyph": "single",
            "flow_family": "single",
            "notation": "s",
            "port_ref": "ports.single_state"
          },
          {
            "id": "pair_context",
            "label": "pair context",
            "role": "read-only pair representation used for logit bias and optional pair values",
            "col": 1,
            "row": 5,
            "prominence": "secondary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.ports.pair_context",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.ports.pair_context",
            "kind": "representation",
            "rep_ref": "pair_context",
            "shape": "B x N_group x N_group x d_pair",
            "scale": "item_pair",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "z",
            "port_ref": "ports.pair_context"
          },
          {
            "id": "updated_single_state",
            "label": "updated single state",
            "role": "attention-updated single/token stream",
            "col": 9,
            "row": 2,
            "prominence": "secondary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.ports.updated_single_state",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.ports.updated_single_state",
            "kind": "representation",
            "rep_ref": "group_state",
            "shape": "B x N_group x d_group",
            "scale": "group",
            "glyph": "single",
            "flow_family": "single",
            "notation": "s'",
            "port_ref": "ports.updated_single_state"
          },
          {
            "id": "project_qkv",
            "label": "Project Q, K, and V",
            "role": "form self-attention terms from the same single-state input",
            "col": 2,
            "row": 2,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_qkv",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.project_qkv",
            "kind": "operation",
            "scale": "operation",
            "detail": "qkv_projection",
            "code": "q, k, v = project_qkv(single_state)",
            "tex": "q_i, k_i, v_i = W_{qkv}s_i",
            "operation": "qkv_projection"
          },
          {
            "id": "queries",
            "label": "queries",
            "col": 3,
            "row": 1,
            "prominence": "context",
            "treatment": "chip",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.queries",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.values.queries",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "Q"
          },
          {
            "id": "keys",
            "label": "keys",
            "col": 3,
            "row": 2,
            "prominence": "context",
            "treatment": "chip",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.keys",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.values.keys",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "K"
          },
          {
            "id": "scalar_values",
            "label": "scalar values",
            "col": 3,
            "row": 3,
            "prominence": "context",
            "treatment": "chip",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.scalar_values",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.values.scalar_values",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "V"
          },
          {
            "id": "scalar_logits_step",
            "label": "Form query-key logits",
            "col": 4,
            "row": 2,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.scalar_logits",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.scalar_logits",
            "kind": "operation",
            "scale": "operation",
            "detail": "attention_logits",
            "code": "scalar_logits = einsum(q, k) * scale",
            "tex": "ell^{qk}_{ijh} = <q_{ih}, k_{jh}> s_h",
            "operation": "attention_logits"
          },
          {
            "id": "scalar_logits",
            "label": "query-key logits",
            "col": 5,
            "row": 2,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.scalar_logits",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.values.scalar_logits",
            "kind": "representation",
            "scale": "item",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "l_qk"
          },
          {
            "id": "project_pair_bias",
            "label": "Project pair bias",
            "role": "the selected architecture variant owns any pair preprocessing before projection",
            "col": 3,
            "row": 5,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_pair_bias",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.project_pair_bias",
            "kind": "operation",
            "scale": "operation",
            "detail": "pair_bias_projection",
            "code": "pair_bias = project_pair(pair_context)",
            "tex": "b_{ijh} = W_h z_{ij}",
            "operation": "pair_bias_projection"
          },
          {
            "id": "pair_bias",
            "label": "projected pair bias",
            "col": 5,
            "row": 5,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.pair_bias",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.values.pair_bias",
            "kind": "representation",
            "scale": "item",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "b_z"
          },
          {
            "id": "combine_logits",
            "label": "Add pair bias",
            "col": 6,
            "row": 3,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.combine_logits",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.combine_logits",
            "kind": "operation",
            "scale": "operation",
            "detail": "pair_bias_add",
            "code": "biased_logits = scalar_logits + pair_bias",
            "tex": "ell_{ijh} = ell^{qk}_{ijh} + b_{ijh}",
            "operation": "pair_bias_add"
          },
          {
            "id": "biased_logits",
            "label": "conditioned logits",
            "col": 7,
            "row": 3,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.biased_logits",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.values.biased_logits",
            "kind": "representation",
            "scale": "item",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "l"
          },
          {
            "id": "softmax_attention_unmasked",
            "label": "Normalize attention",
            "col": 8,
            "row": 3,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.softmax_attention_unmasked",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.softmax_attention_unmasked",
            "kind": "operation",
            "scale": "operation",
            "detail": "softmax",
            "code": "attention = softmax(biased_logits, dim=keys)",
            "tex": "a_{ijh} = softmax_j(ell_{ijh})",
            "operation": "softmax"
          },
          {
            "id": "attention_weights",
            "label": "attention weights",
            "col": 9,
            "row": 3,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.attention_weights",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.values.attention_weights",
            "kind": "representation",
            "scale": "item",
            "glyph": "pair",
            "flow_family": "pair",
            "notation": "a"
          },
          {
            "id": "aggregate_scalar_values",
            "label": "Aggregate scalar values",
            "col": 6,
            "row": 1,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.aggregate_scalar_values",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.aggregate_scalar_values",
            "kind": "operation",
            "scale": "operation",
            "detail": "weighted_sum",
            "code": "scalar_context = einsum(attention, v)",
            "tex": "o^s_{ih} = sum_j a_{ijh} v_{jh}",
            "operation": "weighted_sum"
          },
          {
            "id": "scalar_context",
            "label": "scalar context",
            "col": 7,
            "row": 1,
            "prominence": "context",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.values.scalar_context",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.values.scalar_context",
            "kind": "representation",
            "scale": "item",
            "glyph": "single",
            "flow_family": "single",
            "notation": "o_s"
          },
          {
            "id": "project_attention_output",
            "label": "Project attention output",
            "col": 8,
            "row": 1,
            "prominence": "primary",
            "treatment": "compact",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_attention_output",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.project_attention_output",
            "kind": "operation",
            "scale": "operation",
            "detail": "output_projection",
            "code": "updated_single_state = output_projection(scalar_context)",
            "operation": "output_projection"
          }
        ],
        "edges": [
          {
            "id": "generic_group_pair_attention__project_qkv__input_1",
            "from": "single_state",
            "to": "project_qkv",
            "kind": "data_flow",
            "carries": [
              "representations.group_state"
            ],
            "relation_path": [
              "relations.group_state_enters_pair_attention"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_qkv",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.project_qkv",
            "template_data_ref": "ports.single_state",
            "connection": {
              "title": "Project Q, K, and V",
              "role": "reusable step input",
              "inside": "q, k, v = project_qkv(single_state)"
            }
          },
          {
            "id": "generic_group_pair_attention__project_qkv__output_1",
            "from": "project_qkv",
            "to": "queries",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_qkv",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.project_qkv",
            "template_data_ref": "values.queries",
            "connection": {
              "title": "Project Q, K, and V",
              "role": "reusable step output",
              "inside": "q, k, v = project_qkv(single_state)"
            }
          },
          {
            "id": "generic_group_pair_attention__project_qkv__output_2",
            "from": "project_qkv",
            "to": "keys",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_qkv",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.project_qkv",
            "template_data_ref": "values.keys",
            "connection": {
              "title": "Project Q, K, and V",
              "role": "reusable step output",
              "inside": "q, k, v = project_qkv(single_state)"
            }
          },
          {
            "id": "generic_group_pair_attention__project_qkv__output_3",
            "from": "project_qkv",
            "to": "scalar_values",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_qkv",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.project_qkv",
            "template_data_ref": "values.scalar_values",
            "connection": {
              "title": "Project Q, K, and V",
              "role": "reusable step output",
              "inside": "q, k, v = project_qkv(single_state)"
            }
          },
          {
            "id": "generic_group_pair_attention__scalar_logits__input_1",
            "from": "queries",
            "to": "scalar_logits_step",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.scalar_logits",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.scalar_logits",
            "template_data_ref": "values.queries",
            "connection": {
              "title": "Form query-key logits",
              "role": "reusable step input",
              "inside": "scalar_logits = einsum(q, k) * scale"
            }
          },
          {
            "id": "generic_group_pair_attention__scalar_logits__input_2",
            "from": "keys",
            "to": "scalar_logits_step",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.scalar_logits",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.scalar_logits",
            "template_data_ref": "values.keys",
            "connection": {
              "title": "Form query-key logits",
              "role": "reusable step input",
              "inside": "scalar_logits = einsum(q, k) * scale"
            }
          },
          {
            "id": "generic_group_pair_attention__scalar_logits__output_1",
            "from": "scalar_logits_step",
            "to": "scalar_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.scalar_logits",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.scalar_logits",
            "template_data_ref": "values.scalar_logits",
            "connection": {
              "title": "Form query-key logits",
              "role": "reusable step output",
              "inside": "scalar_logits = einsum(q, k) * scale"
            }
          },
          {
            "id": "generic_group_pair_attention__project_pair_bias__input_1",
            "from": "pair_context",
            "to": "project_pair_bias",
            "kind": "conditioning",
            "tone": "conditioning",
            "carries": [
              "representations.pair_context"
            ],
            "relation_path": [
              "relations.pair_context_biases_pair_attention"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_pair_bias",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.project_pair_bias",
            "template_data_ref": "ports.pair_context",
            "connection": {
              "title": "Project pair bias",
              "role": "reusable step input",
              "inside": "pair_bias = project_pair(pair_context)"
            }
          },
          {
            "id": "generic_group_pair_attention__project_pair_bias__output_1",
            "from": "project_pair_bias",
            "to": "pair_bias",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_pair_bias",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.project_pair_bias",
            "template_data_ref": "values.pair_bias",
            "connection": {
              "title": "Project pair bias",
              "role": "reusable step output",
              "inside": "pair_bias = project_pair(pair_context)"
            }
          },
          {
            "id": "generic_group_pair_attention__combine_logits__input_1",
            "from": "scalar_logits",
            "to": "combine_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.combine_logits",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.combine_logits",
            "template_data_ref": "values.scalar_logits",
            "connection": {
              "title": "Add pair bias",
              "role": "reusable step input",
              "inside": "biased_logits = scalar_logits + pair_bias"
            }
          },
          {
            "id": "generic_group_pair_attention__combine_logits__input_2",
            "from": "pair_bias",
            "to": "combine_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.combine_logits",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.combine_logits",
            "template_data_ref": "values.pair_bias",
            "connection": {
              "title": "Add pair bias",
              "role": "reusable step input",
              "inside": "biased_logits = scalar_logits + pair_bias"
            }
          },
          {
            "id": "generic_group_pair_attention__combine_logits__output_1",
            "from": "combine_logits",
            "to": "biased_logits",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.combine_logits",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.combine_logits",
            "template_data_ref": "values.biased_logits",
            "connection": {
              "title": "Add pair bias",
              "role": "reusable step output",
              "inside": "biased_logits = scalar_logits + pair_bias"
            }
          },
          {
            "id": "generic_group_pair_attention__softmax_attention_unmasked__input_1",
            "from": "biased_logits",
            "to": "softmax_attention_unmasked",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.softmax_attention_unmasked",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.softmax_attention_unmasked",
            "template_data_ref": "values.biased_logits",
            "connection": {
              "title": "Normalize attention",
              "role": "reusable step input",
              "inside": "attention = softmax(biased_logits, dim=keys)"
            }
          },
          {
            "id": "generic_group_pair_attention__softmax_attention_unmasked__output_1",
            "from": "softmax_attention_unmasked",
            "to": "attention_weights",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.softmax_attention_unmasked",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.softmax_attention_unmasked",
            "template_data_ref": "values.attention_weights",
            "connection": {
              "title": "Normalize attention",
              "role": "reusable step output",
              "inside": "attention = softmax(biased_logits, dim=keys)"
            }
          },
          {
            "id": "generic_group_pair_attention__aggregate_scalar_values__input_1",
            "from": "attention_weights",
            "to": "aggregate_scalar_values",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.aggregate_scalar_values",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.aggregate_scalar_values",
            "template_data_ref": "values.attention_weights",
            "connection": {
              "title": "Aggregate scalar values",
              "role": "reusable step input",
              "inside": "scalar_context = einsum(attention, v)"
            }
          },
          {
            "id": "generic_group_pair_attention__aggregate_scalar_values__input_2",
            "from": "scalar_values",
            "to": "aggregate_scalar_values",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.aggregate_scalar_values",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.aggregate_scalar_values",
            "template_data_ref": "values.scalar_values",
            "connection": {
              "title": "Aggregate scalar values",
              "role": "reusable step input",
              "inside": "scalar_context = einsum(attention, v)"
            }
          },
          {
            "id": "generic_group_pair_attention__aggregate_scalar_values__output_1",
            "from": "aggregate_scalar_values",
            "to": "scalar_context",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.aggregate_scalar_values",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.aggregate_scalar_values",
            "template_data_ref": "values.scalar_context",
            "connection": {
              "title": "Aggregate scalar values",
              "role": "reusable step output",
              "inside": "scalar_context = einsum(attention, v)"
            }
          },
          {
            "id": "generic_group_pair_attention__project_attention_output__input_1",
            "from": "scalar_context",
            "to": "project_attention_output",
            "kind": "data_flow",
            "carries": [

            ],
            "grounding": "standard_block_template",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_attention_output",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.project_attention_output",
            "template_data_ref": "values.scalar_context",
            "connection": {
              "title": "Project attention output",
              "role": "reusable step input",
              "inside": "updated_single_state = output_projection(scalar_context)"
            }
          },
          {
            "id": "generic_group_pair_attention__project_attention_output__output_1",
            "from": "project_attention_output",
            "to": "updated_single_state",
            "kind": "data_flow",
            "carries": [
              "representations.group_state"
            ],
            "relation_path": [
              "relations.pair_attention_updates_group_state"
            ],
            "grounding": "canonical_relation_path",
            "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
            "standard_block_id": "pair_biased_attention",
            "block_instance_ref": "block_instances.generic_group_pair_attention",
            "template_fact_ref": "standard_blocks.pair_biased_attention.steps.project_attention_output",
            "instance_fact_ref": "block_instances.generic_group_pair_attention.steps.project_attention_output",
            "template_data_ref": "ports.updated_single_state",
            "connection": {
              "title": "Project attention output",
              "role": "reusable step output",
              "inside": "updated_single_state = output_projection(scalar_context)"
            }
          }
        ],
        "projectionMode": "standard_block_template",
        "standardBlockRef": "standard_blocks/pair-biased-attention.yaml",
        "standardBlockId": "pair_biased_attention",
        "blockInstanceRef": "block_instances.generic_group_pair_attention",
        "variant": "logit_bias_only",
        "variantLabel": "Pair-logit bias",
        "useScope": "whole_module",
        "conformance": "exact",
        "pseudocode": [
          {
            "id": "project_qkv",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_qkv",
            "instanceFactRef": "block_instances.generic_group_pair_attention.steps.project_qkv",
            "label": "Project Q, K, and V",
            "operation": "qkv_projection",
            "code": "q, k, v = project_qkv(single_state)",
            "tex": "q_i, k_i, v_i = W_{qkv}s_i",
            "inputs": [
              "ports.single_state"
            ],
            "outputs": [
              "values.queries",
              "values.keys",
              "values.scalar_values"
            ]
          },
          {
            "id": "scalar_logits",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.scalar_logits",
            "instanceFactRef": "block_instances.generic_group_pair_attention.steps.scalar_logits",
            "label": "Form query-key logits",
            "operation": "attention_logits",
            "code": "scalar_logits = einsum(q, k) * scale",
            "tex": "ell^{qk}_{ijh} = <q_{ih}, k_{jh}> s_h",
            "inputs": [
              "values.queries",
              "values.keys"
            ],
            "outputs": [
              "values.scalar_logits"
            ]
          },
          {
            "id": "project_pair_bias",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_pair_bias",
            "instanceFactRef": "block_instances.generic_group_pair_attention.steps.project_pair_bias",
            "label": "Project pair bias",
            "operation": "pair_bias_projection",
            "code": "pair_bias = project_pair(pair_context)",
            "tex": "b_{ijh} = W_h z_{ij}",
            "inputs": [
              "ports.pair_context"
            ],
            "outputs": [
              "values.pair_bias"
            ]
          },
          {
            "id": "combine_logits",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.combine_logits",
            "instanceFactRef": "block_instances.generic_group_pair_attention.steps.combine_logits",
            "label": "Add pair bias",
            "operation": "pair_bias_add",
            "code": "biased_logits = scalar_logits + pair_bias",
            "tex": "ell_{ijh} = ell^{qk}_{ijh} + b_{ijh}",
            "inputs": [
              "values.scalar_logits",
              "values.pair_bias"
            ],
            "outputs": [
              "values.biased_logits"
            ]
          },
          {
            "id": "softmax_attention_unmasked",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.softmax_attention_unmasked",
            "instanceFactRef": "block_instances.generic_group_pair_attention.steps.softmax_attention_unmasked",
            "label": "Normalize attention",
            "operation": "softmax",
            "code": "attention = softmax(biased_logits, dim=keys)",
            "tex": "a_{ijh} = softmax_j(ell_{ijh})",
            "inputs": [
              "values.biased_logits"
            ],
            "outputs": [
              "values.attention_weights"
            ]
          },
          {
            "id": "aggregate_scalar_values",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.aggregate_scalar_values",
            "instanceFactRef": "block_instances.generic_group_pair_attention.steps.aggregate_scalar_values",
            "label": "Aggregate scalar values",
            "operation": "weighted_sum",
            "code": "scalar_context = einsum(attention, v)",
            "tex": "o^s_{ih} = sum_j a_{ijh} v_{jh}",
            "inputs": [
              "values.attention_weights",
              "values.scalar_values"
            ],
            "outputs": [
              "values.scalar_context"
            ]
          },
          {
            "id": "project_attention_output",
            "templateFactRef": "standard_blocks.pair_biased_attention.steps.project_attention_output",
            "instanceFactRef": "block_instances.generic_group_pair_attention.steps.project_attention_output",
            "label": "Project attention output",
            "operation": "output_projection",
            "code": "updated_single_state = output_projection(scalar_context)",
            "inputs": [
              "values.scalar_context"
            ],
            "outputs": [
              "ports.updated_single_state"
            ]
          }
        ]
      }
    ]
  }
};

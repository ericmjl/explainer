export const manifest = {
  "schemaVersion": "architecture-manifest-v0.4",
  "architecture": {
    "schemaVersion": "architecture-v0.4",
    "id": "generic_feature_refinement",
    "name": "Generic Feature Refinement Pipeline",
    "status": "draft",
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
        "kind": "feature_adapter",
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
        "kind": "pair_context_builder",
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
        "kind": "attention_stack",
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
        "kind": "adaptive_normalization",
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
        "kind": "attention_update",
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
        "kind": "scale_transition",
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
        "kind": "attention_stack",
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
        "kind": "attention_update",
        "role": "update group state with full attention and pair/context logit bias",
        "scale": "group",
        "standard_block_ref": "../../standard_blocks/pair-biased-attention.yaml",
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
        "kind": "prediction_heads",
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
        "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
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
      ]
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
        "path": "facebookresearch/DiT/models.py",
        "url": "https://github.com/facebookresearch/DiT/blob/main/models.py",
        "href": "https://github.com/facebookresearch/DiT/blob/main/models.py"
      },
      {
        "id": "dit_sample_code",
        "kind": "code",
        "title": "DiT sampling entry point",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "path": "facebookresearch/DiT/sample.py",
        "url": "https://github.com/facebookresearch/DiT/blob/main/sample.py",
        "href": "https://github.com/facebookresearch/DiT/blob/main/sample.py"
      },
      {
        "id": "dit_gaussian_diffusion_code",
        "kind": "code",
        "title": "DiT Gaussian diffusion implementation",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "path": "facebookresearch/DiT/diffusion/gaussian_diffusion.py",
        "url": "https://github.com/facebookresearch/DiT/blob/main/diffusion/gaussian_diffusion.py",
        "href": "https://github.com/facebookresearch/DiT/blob/main/diffusion/gaussian_diffusion.py"
      },
      {
        "id": "dit_train_code",
        "kind": "code",
        "title": "DiT training entry point",
        "organization": "facebookresearch",
        "repository": "facebookresearch/DiT",
        "path": "facebookresearch/DiT/train.py",
        "url": "https://github.com/facebookresearch/DiT/blob/main/train.py",
        "href": "https://github.com/facebookresearch/DiT/blob/main/train.py"
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
      "sources": [
        {
          "id": "demo_source",
          "source_ref": "generic_feature_refinement_source"
        }
      ],
      "symbols": [
        {
          "id": "raw_records",
          "name": "raw_records",
          "architectureRef": "representations.raw_records"
        },
        {
          "id": "item_state",
          "name": "x",
          "architectureRef": "representations.item_state"
        },
        {
          "id": "conditioning_signal",
          "name": "s",
          "architectureRef": "representations.conditioning_signal"
        },
        {
          "id": "pair_context",
          "name": "c",
          "architectureRef": "representations.pair_context"
        },
        {
          "id": "group_state",
          "name": "g",
          "architectureRef": "representations.group_state"
        },
        {
          "id": "item_output_state",
          "name": "o",
          "architectureRef": "representations.item_output_state"
        },
        {
          "id": "predictions",
          "name": "y",
          "architectureRef": "representations.predictions"
        }
      ],
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
      ]
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
            "row": 2
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
      }
    ]
  }
};

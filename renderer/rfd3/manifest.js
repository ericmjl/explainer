export const manifest = {
  "architecture": {
    "id": "rfd3_diffusion_module",
    "name": "RF Diffusion 3 Diffusion Module",
    "status": "partial",
    "sourceYaml": "../../architectures/rfd3-diffusion-module.yaml",
    "modules": [
      {
        "id": "atom14_padding_pipeline",
        "label": "Atom14 padding pipeline",
        "kind": "featurization",
        "role": "convert residue tokens to dense atom14 slots with VX virtual atoms",
        "scale": "atom",
        "outputs": [
          "atom14_slots",
          "atom_to_token_index"
        ],
        "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml",
        "pseudocode_line_ids": [
          "pad_atom14_slots"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "config",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/configs/datasets/design_base.yaml",
              "lines": "35-42"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/transforms/virtual_atoms.py",
              "lines": "139-145,198-223,263-290"
            }
          ]
        }
      },
      {
        "id": "token_initializer",
        "label": "TokenInitializer",
        "kind": "initializer",
        "role": "build initial token singles, token pairs, atom conditioning, and atom-pair representation before diffusion",
        "scale": "mixed",
        "story_ref": "../../stories/rfd3-diffusion-module/",
        "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml",
        "pseudocode_line_ids": [
          "token_initializer_call",
          "build_atom_pair_repr",
          "expand_token_pair_to_atom_pair",
          "pool_atom_pair_back_to_token_pair"
        ],
        "contains": [
          {
            "id": "token_pair_initializer",
            "label": "token pair initializer + pairformer",
            "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml"
          },
          {
            "id": "atom_pair_constructor",
            "label": "P_LL atom-pair constructor",
            "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml"
          },
          {
            "id": "pairwise_mean_pool",
            "label": "atom-pair to token-pair mean pool",
            "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml"
          }
        ],
        "inputs": [
          "atom14_slots",
          "atom_to_token_index"
        ],
        "outputs": [
          "atom_state",
          "atom_conditioning",
          "atom_pair_repr",
          "token_state",
          "token_pair_repr"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/encoders.py",
              "lines": "61-144,163-292"
            }
          ]
        }
      },
      {
        "id": "atom_attention_encoder",
        "label": "LocalAtomTransformer encoder",
        "kind": "attention_stack",
        "role": "update atom14 slot states with local atom attention and P_LL pair bias, then downcast atoms to tokens",
        "scale": "atom",
        "repeats": 3,
        "story_ref": "../../stories/rfd3-diffusion-module/",
        "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml",
        "pseudocode_line_ids": [
          "noisy_coords_to_atom_state",
          "build_sparse_neighborhood",
          "atom_attention_pair_bias",
          "atom_to_token_downcast"
        ],
        "depth": {
          "blocks": 3,
          "heads": 4
        },
        "contains": [
          {
            "id": "local_attention_pair_bias",
            "label": "LocalAttentionPairBias",
            "standard_block_ref": "../../standard_blocks/pair-biased-attention.yaml",
            "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml"
          },
          {
            "id": "atom_to_token_downcast",
            "label": "atom-to-token downcast",
            "standard_block_ref": "../../standard_blocks/atom-to-token-scatter-mean.yaml",
            "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml"
          }
        ],
        "inputs": [
          "atom_state",
          "atom_conditioning",
          "atom_pair_repr",
          "noisy_coordinates",
          "atom_to_token_index"
        ],
        "outputs": [
          "atom_state",
          "token_state"
        ],
        "coordinate_injection": {
          "active": true,
          "source": "noisy_coordinates",
          "operation": "Q_L = Q_L_init + process_r(R_noisy_L)",
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "kind": "code",
                "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
                "lines": "211-220"
              }
            ]
          }
        },
        "attention": {
          "pattern": "structure_local_sparse",
          "query_scale": "atom",
          "key_value_scale": "atom",
          "window": {
            "kind": "sequence_neighbors_plus_spatial_knn",
            "size": "data_dependent"
          },
          "pair_bias": true,
          "pair_bias_source": "atom_pair_repr",
          "standard_block_ref": "../../standard_blocks/pair-biased-attention.yaml",
          "positional_encoding": {
            "kind": "none_explicit_in_attention_block"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "196-240"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/blocks.py",
              "lines": "642-711"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/attention.py",
              "lines": "206,264-275,337-340,426-440"
            }
          ]
        }
      },
      {
        "id": "diffusion_token_encoder",
        "label": "DiffusionTokenEncoder",
        "kind": "pairformer_conditioning",
        "role": "update S_I and Z_II using residue/token features and noisy representative-coordinate distograms",
        "scale": "token_pair",
        "repeats": 2,
        "story_ref": "../../stories/rfd3-diffusion-module/",
        "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml",
        "pseudocode_line_ids": [
          "token_encoder_with_noisy_distogram",
          "token_pairformer_updates_z"
        ],
        "depth": {
          "blocks": 2,
          "heads": 16
        },
        "inputs": [
          "token_state",
          "token_pair_repr",
          "noisy_coordinates"
        ],
        "outputs": [
          "token_state",
          "token_pair_repr"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/encoders.py",
              "lines": "381-414"
            },
            {
              "kind": "config",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/configs/model/components/rfd3_net.yaml",
              "lines": "95-107"
            }
          ]
        }
      },
      {
        "id": "diffusion_transformer",
        "label": "LocalTokenTransformer",
        "kind": "attention_stack",
        "role": "update token state with local token attention conditioned by Z_II pair bias and S_I AdaLN conditioning",
        "scale": "token",
        "repeats": 18,
        "story_ref": "../../stories/rfd3-diffusion-module/",
        "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml",
        "pseudocode_line_ids": [
          "token_transformer_call",
          "token_attention_pair_bias"
        ],
        "depth": {
          "blocks": 18,
          "heads": 16
        },
        "contains": [
          {
            "id": "token_local_attention_pair_bias",
            "label": "token LocalAttentionPairBias",
            "standard_block_ref": "../../standard_blocks/pair-biased-attention.yaml",
            "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml"
          }
        ],
        "inputs": [
          "token_state",
          "token_pair_repr",
          "noisy_coordinates"
        ],
        "outputs": [
          "token_state"
        ],
        "modulation": {
          "type": "per_token_adaln",
          "source": "token_state_conditioning",
          "target": "token_state",
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "kind": "code",
                "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/blocks.py",
                "lines": "663-711"
              }
            ]
          }
        },
        "attention": {
          "pattern": "structure_local_sparse",
          "query_scale": "token",
          "key_value_scale": "token",
          "window": {
            "kind": "sequence_neighbors_plus_spatial_knn",
            "size": "data_dependent"
          },
          "pair_bias": true,
          "pair_bias_source": "token_pair_repr",
          "standard_block_ref": "../../standard_blocks/pair-biased-attention.yaml",
          "positional_encoding": {
            "kind": "none_explicit_in_attention_block"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "330-342"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/blocks.py",
              "lines": "589-639,663-711"
            },
            {
              "kind": "config",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/configs/model/components/rfd3_net.yaml",
              "lines": "109-116"
            }
          ]
        }
      },
      {
        "id": "atom_attention_decoder",
        "label": "CompactStreamingDecoder",
        "kind": "attention_stack",
        "role": "upcast token output back to atom14 slots, run local atom attention with P_LL pair bias, and return decoded atom state",
        "scale": "atom",
        "repeats": 3,
        "story_ref": "../../stories/rfd3-diffusion-module/",
        "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml",
        "pseudocode_line_ids": [
          "token_to_atom_upcast",
          "decoder_atom_attention_pair_bias",
          "coordinate_sequence_heads"
        ],
        "depth": {
          "blocks": 3,
          "heads": 4
        },
        "contains": [
          {
            "id": "token_to_atom_upcast",
            "label": "token-to-atom upcast",
            "standard_block_ref": "../../standard_blocks/token-to-atom-gather.yaml",
            "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml"
          },
          {
            "id": "decoder_local_attention_pair_bias",
            "label": "decoder LocalAttentionPairBias",
            "standard_block_ref": "../../standard_blocks/pair-biased-attention.yaml",
            "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml"
          }
        ],
        "inputs": [
          "token_state",
          "atom_state",
          "atom_conditioning",
          "atom_pair_repr",
          "atom_to_token_index"
        ],
        "outputs": [
          "atom_state",
          "coordinate_update"
        ],
        "attention": {
          "pattern": "structure_local_sparse",
          "query_scale": "atom",
          "key_value_scale": "atom",
          "window": {
            "kind": "sequence_neighbors_plus_spatial_knn",
            "size": "data_dependent"
          },
          "pair_bias": true,
          "pair_bias_source": "atom_pair_repr",
          "standard_block_ref": "../../standard_blocks/pair-biased-attention.yaml",
          "positional_encoding": {
            "kind": "none_explicit_in_attention_block"
          }
        },
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "347-379"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/blocks.py",
              "lines": "714-777"
            },
            {
              "kind": "config",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/configs/model/components/rfd3_net.yaml",
              "lines": "118-127"
            }
          ]
        }
      },
      {
        "id": "coordinate_sequence_heads",
        "label": "Coordinate and sequence heads",
        "kind": "output_heads",
        "role": "project decoded atom state to atom coordinate updates and token sequence logits",
        "scale": "mixed",
        "pseudocode_ref": "../../pseudocode/rfd3-diffusion-module.yaml",
        "pseudocode_line_ids": [
          "coordinate_sequence_heads"
        ],
        "inputs": [
          "atom_state",
          "token_state"
        ],
        "outputs": [
          "coordinate_update"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "375-380"
            }
          ]
        }
      }
    ],
    "representations": [
      {
        "id": "atom14_slots",
        "scale": "atom",
        "semantic_role": "dense atom slots per residue/token, including virtual VX slots",
        "shape": "N_atom = 14 x N_token for standard protein design residues",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "config",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/configs/datasets/design_base.yaml",
              "lines": "35-42"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/transforms/virtual_atoms.py",
              "lines": "139-145,198-223,263-290"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/constants.py",
              "lines": "178-188"
            }
          ]
        }
      },
      {
        "id": "atom_to_token_index",
        "scale": "atom_to_token",
        "semantic_role": "map from each atom14 slot back to the residue/token that owns it",
        "shape": "N_atom",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "193-195"
            }
          ]
        }
      },
      {
        "id": "noisy_coordinates",
        "scale": "coordinate",
        "semantic_role": "current noisy atom coordinates at the diffusion step",
        "shape": "N_atom x 3",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/trainer/rfd3.py",
              "lines": "94-101"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "211-220"
            }
          ]
        }
      },
      {
        "id": "atom_state",
        "scale": "atom",
        "semantic_role": "Q_L atom stream updated by local atom attention and projected to coordinate updates",
        "shape": "N_atom x c_atom",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "220-240,347-379"
            }
          ]
        }
      },
      {
        "id": "atom_conditioning",
        "scale": "atom",
        "semantic_role": "C_L atom conditioning stream used for AdaLN and carried through encoder/decoder",
        "shape": "N_atom x c_atom",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/encoders.py",
              "lines": "222-223,286-292"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/attention.py",
              "lines": "219-228,283-288"
            }
          ]
        }
      },
      {
        "id": "atom_pair_repr",
        "scale": "atom_pair",
        "semantic_role": "P_LL atom-pair representation projected to local attention pair-bias logits",
        "shape": "N_atom x N_atom x c_pair, or sparse chunks when chunked pairwise is active",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/encoders.py",
              "lines": "237-268,286-292"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/attention.py",
              "lines": "206,264-275,337-340"
            }
          ]
        }
      },
      {
        "id": "token_state",
        "scale": "token",
        "semantic_role": "A_I token stream initialized from noisy coordinates and atom downcast, then updated by token transformer",
        "shape": "N_token x c_token",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/blocks.py",
              "lines": "201-227,518-577"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "216-240,330-342"
            }
          ]
        }
      },
      {
        "id": "token_pair_repr",
        "scale": "token_pair",
        "semantic_role": "Z_II token pair state initialized by TokenInitializer and updated by DiffusionTokenEncoder pairformer blocks",
        "shape": "N_token x N_token x c_pair",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/encoders.py",
              "lines": "172-217,271-278,381-414"
            }
          ]
        }
      },
      {
        "id": "coordinate_update",
        "scale": "coordinate",
        "semantic_role": "atom-coordinate update projected from decoded Q_L",
        "shape": "N_atom x 3",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "375-380"
            }
          ]
        }
      }
    ],
    "execution": {
      "loops": [
        {
          "id": "diffusion_module_step",
          "repeats": "training_forward_or_sampler_step",
          "reruns": [
            "atom_attention_encoder",
            "diffusion_token_encoder",
            "diffusion_transformer",
            "atom_attention_decoder"
          ],
          "cached": [
            "token_initializer_outputs",
            "atom_to_token_index",
            "atom_pair_repr"
          ],
          "notes": [
            "RFD3.forward runs TokenInitializer before calling the diffusion module; the sampler receives the same initializer outputs.",
            "The diffusion module then runs an atom encoder, token encoder, token transformer, and atom decoder for the current noisy coordinates."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "kind": "code",
                "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3.py",
                "lines": "77-104"
              },
              {
                "kind": "code",
                "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
                "lines": "171-240,269-380"
              }
            ]
          }
        },
        {
          "id": "recycle_loop",
          "repeats": "n_recycle",
          "reruns": [
            "diffusion_token_encoder",
            "diffusion_transformer",
            "atom_attention_decoder"
          ],
          "cached": [
            "token_initializer_outputs",
            "atom_pair_repr"
          ],
          "notes": [
            "Each recycle refreshes token pair/single features from the current structure signal, runs the token transformer, decodes atom updates, and rebuilds the self distogram."
          ],
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "kind": "code",
                "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
                "lines": "269-380"
              }
            ]
          }
        }
      ],
      "cached_state": [
        {
          "id": "token_initializer_outputs",
          "produced_by": "token_initializer",
          "consumed_by": [
            "rfd3_diffusion_module"
          ],
          "scope": "model_forward",
          "evidence": {
            "status": "confirmed_from_code",
            "refs": [
              {
                "kind": "code",
                "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3.py",
                "lines": "77-87,96-104"
              }
            ]
          }
        }
      ]
    },
    "stateSemantics": {
      "atom14_slots": {
        "role": "static_input_topology",
        "produced_by": "atom14_padding_pipeline",
        "updated_by": [

        ],
        "consumed_by": [
          "token_initializer",
          "atom_attention_encoder",
          "atom_attention_decoder"
        ],
        "notes": [
          "Protein design inputs are padded to 14 atom slots per token in the dense association scheme.",
          "Virtual slots are represented as VX atoms and remain part of the atom-level tensors."
        ]
      },
      "atom_pair_repr": {
        "role": "read_only_atom_pair_conditioning",
        "produced_by": "token_initializer",
        "updated_by": [

        ],
        "consumed_by": [
          "atom_attention_encoder",
          "atom_attention_decoder"
        ],
        "notes": [
          "P_LL is projected to per-head pair-bias logits inside LocalAttentionPairBias.",
          "P_LL contains atom-pair terms plus token pair Z_II expanded by atom_to_token_map."
        ]
      },
      "token_pair_repr": {
        "role": "mutable_token_pair_state",
        "produced_by": "token_initializer",
        "updated_by": [
          "diffusion_token_encoder"
        ],
        "consumed_by": [
          "diffusion_transformer"
        ],
        "notes": [
          "Z_II begins from TokenInitializer pair features and is updated by pairformer blocks in DiffusionTokenEncoder."
        ]
      },
      "token_state": {
        "role": "mutable_token_state",
        "produced_by": [
          "noisy_coordinate_pool",
          "atom_to_token_downcast"
        ],
        "updated_by": [
          "diffusion_token_encoder",
          "diffusion_transformer"
        ],
        "consumed_by": [
          "atom_attention_decoder"
        ]
      },
      "atom_state": {
        "role": "mutable_atom_state",
        "produced_by": [
          "token_initializer",
          "noisy_coordinate_injection"
        ],
        "updated_by": [
          "atom_attention_encoder",
          "atom_attention_decoder"
        ],
        "consumed_by": [
          "coordinate_head"
        ]
      },
      "atom_conditioning": {
        "role": "read_only_atom_conditioning",
        "produced_by": "token_initializer",
        "updated_by": [

        ],
        "consumed_by": [
          "atom_attention_encoder",
          "atom_attention_decoder"
        ]
      },
      "noisy_coordinates": {
        "role": "current_diffusion_state",
        "produced_by": "flow_or_diffusion_noising",
        "updated_by": [
          "sampler"
        ],
        "consumed_by": [
          "noisy_coordinate_injection",
          "neighborhood_builder",
          "diffusion_token_encoder"
        ]
      }
    },
    "conditioning": [
      {
        "id": "atom_attention_pair_bias",
        "source": "atom_pair_repr",
        "target": "atom_attention_encoder.attention_logits",
        "mode": "pair_bias",
        "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/attention.py",
              "lines": "206,337-340,426-440,457-486"
            }
          ]
        }
      },
      {
        "id": "decoder_atom_attention_pair_bias",
        "source": "atom_pair_repr",
        "target": "atom_attention_decoder.attention_logits",
        "mode": "pair_bias",
        "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "347-373"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/attention.py",
              "lines": "206,337-340,426-440"
            }
          ]
        }
      },
      {
        "id": "token_attention_pair_bias",
        "source": "token_pair_repr",
        "target": "diffusion_transformer.attention_logits",
        "mode": "pair_bias",
        "standard_block_ref": "standard_blocks/pair-biased-attention.yaml",
        "updates_source": false,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/blocks.py",
              "lines": "589-639,663-711"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/attention.py",
              "lines": "206,337-340,426-440"
            }
          ]
        }
      },
      {
        "id": "noisy_coordinate_to_atom_state",
        "source": "noisy_coordinates",
        "target": "atom_state",
        "mode": "coordinate_injection",
        "standard_block_ref": "standard_blocks/coordinate-injection.yaml",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "211-220"
            }
          ]
        }
      },
      {
        "id": "atom_conditioning_adaln",
        "source": "atom_conditioning",
        "target": "atom_state",
        "mode": "per_atom_adaln",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/attention.py",
              "lines": "219-228,283-288"
            }
          ]
        }
      }
    ],
    "scaleTransitions": [
      {
        "id": "encoder_atom_to_token_downcast",
        "from_scale": "atom",
        "to_scale": "token",
        "source": "atom_state",
        "target": "token_state",
        "projection": "downcast_q",
        "index_map": "atom_to_token_index",
        "aggregation": "cross_attention_or_mean_by_token_atom_slots",
        "copy_vs_pool": "pool",
        "standard_block_ref": "standard_blocks/atom-to-token-scatter-mean.yaml",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "225-240"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/blocks.py",
              "lines": "518-577"
            }
          ]
        }
      },
      {
        "id": "token_to_atom_upcast_decoder",
        "from_scale": "token",
        "to_scale": "atom",
        "source": "token_state",
        "target": "atom_state",
        "projection": "upcast_a",
        "index_map": "atom_to_token_index",
        "aggregation": "broadcast_or_cross_attention_to_token_atom_slots",
        "copy_vs_pool": "copy_or_attention",
        "standard_block_ref": "standard_blocks/token-to-atom-gather.yaml",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "347-373"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/blocks.py",
              "lines": "469-515,714-777"
            }
          ]
        }
      }
    ],
    "trainingInference": {
      "objective": {
        "kind": "all_atom_denoising",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/trainer/rfd3.py",
              "lines": "94-101"
            },
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/metrics/losses.py",
              "lines": "103-120"
            }
          ]
        }
      },
      "virtual_atom_loss_weight": {
        "default": 1.0,
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "config",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/configs/trainer/loss/losses/diffusion_loss.yaml",
              "lines": "5"
            }
          ]
        }
      },
      "sampler": {
        "kind": "diffusion_sampling",
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3.py",
              "lines": "96-104"
            }
          ]
        }
      }
    },
    "edges": [
      {
        "from": "atom14_padding_pipeline",
        "to": "token_initializer",
        "operation": "atom14_features",
        "carries": [
          "atom14_slots",
          "atom_to_token_index"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/transforms/virtual_atoms.py",
              "lines": "139-145,198-223,263-290"
            }
          ]
        }
      },
      {
        "from": "token_initializer",
        "to": "atom_attention_encoder",
        "operation": "initialize_atom_attention_inputs",
        "carries": [
          "atom_state",
          "atom_conditioning",
          "atom_pair_repr"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/encoders.py",
              "lines": "222-292"
            }
          ]
        }
      },
      {
        "from": "noisy_coordinates",
        "to": "atom_attention_encoder",
        "operation": "coordinate_injection_and_neighborhood",
        "carries": [
          "noisy_coordinates"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "196-220"
            }
          ]
        }
      },
      {
        "from": "atom_attention_encoder",
        "to": "diffusion_token_encoder",
        "operation": "atom_to_token_downcast",
        "carries": [
          "token_state"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "225-240"
            }
          ]
        }
      },
      {
        "from": "token_initializer",
        "to": "diffusion_token_encoder",
        "operation": "initialized_token_pair_and_single",
        "carries": [
          "token_pair_repr",
          "token_state"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/encoders.py",
              "lines": "172-217,271-292"
            }
          ]
        }
      },
      {
        "from": "diffusion_token_encoder",
        "to": "diffusion_transformer",
        "operation": "token_pair_conditioning",
        "carries": [
          "token_state",
          "token_pair_repr"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/layers/encoders.py",
              "lines": "381-414"
            }
          ]
        }
      },
      {
        "from": "diffusion_transformer",
        "to": "atom_attention_decoder",
        "operation": "token_to_atom_upcast",
        "carries": [
          "token_state"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "330-373"
            }
          ]
        }
      },
      {
        "from": "token_initializer",
        "to": "atom_attention_decoder",
        "operation": "atom_attention_skip_conditioning",
        "carries": [
          "atom_conditioning",
          "atom_pair_repr"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "347-373"
            }
          ]
        }
      },
      {
        "from": "atom_attention_decoder",
        "to": "coordinate_sequence_heads",
        "operation": "decoded_atom_state",
        "carries": [
          "atom_state"
        ],
        "evidence": {
          "status": "confirmed_from_code",
          "refs": [
            {
              "kind": "code",
              "path": "/home/ruh/research/PhD/related_work/foundry/models/rfd3/src/rfd3/model/RFD3_diffusion_module.py",
              "lines": "375-380"
            }
          ]
        }
      }
    ],
    "claims": [
      "RFD3 protein design inputs use dense atom14 slots per token/residue, including VX virtual atom slots.",
      "RFD3 atom encoder and decoder attention use LocalAttentionPairBias, projecting P_LL into attention-logit pair bias.",
      "The atom-level P_LL bias is not directly pairwise distance bias from noisy atom coordinates; noisy coordinates enter Q_L and sparse neighborhood construction, while P_LL is built from reference/motif atom-pair features, atom single outer terms, and token pair Z_II expanded to atom pairs.",
      "Token pair state Z_II is expanded to atom-pair scale with atom_to_token_map when building P_LL.",
      "DiffusionTokenEncoder updates token pair state with pairformer blocks before the LocalTokenTransformer consumes Z_II as attention pair bias.",
      "Virtual atom slots are present in atom-level tensors and default diffusion loss weighting; inference cleanup later removes invalid virtual slots according to the predicted residue atom scheme."
    ]
  },
  "standardBlocks": {
    "pair_biased_attention": {
      "id": "pair_biased_attention",
      "name": "Pair-Biased Attention",
      "description": "Add a projected pair representation to query/key attention logits before masking and softmax.",
      "math": [
        {
          "id": "qk_logits",
          "text": "logits_ijh = dot(q_ih, k_jh) * scale",
          "tex": "\\ell^{qk}_{ijh} = \\langle q_{ih}, k_{jh} \\rangle \\cdot s",
          "operation": "attention_logits"
        },
        {
          "id": "project_pair",
          "text": "pair_bias_ijh = Linear(LayerNorm(z_ij))",
          "tex": "b_{ijh} = W_h\\,\\operatorname{LN}(z_{ij})",
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
    "atom_to_token_scatter_mean": {
      "id": "atom_to_token_scatter_mean",
      "name": "Atom-To-Token Scatter Mean",
      "description": "Project atom features to token width and average atoms assigned to the same token index.",
      "math": [
        {
          "id": "project_atom_state",
          "text": "h_atom = Linear(atom_state)",
          "tex": "h_i^{atom} = W\\,a_i",
          "operation": "projection"
        },
        {
          "id": "scatter_mean",
          "text": "token_j = mean({h_atom_i | atom_to_token_i = j})",
          "tex": "t_j = \\frac{1}{|A_j|}\\sum_{i \\in A_j} h_i^{atom},\\quad A_j = \\{i:\\operatorname{tok}(i)=j\\}",
          "operation": "scatter_mean"
        }
      ]
    },
    "token_to_atom_gather": {
      "id": "token_to_atom_gather",
      "name": "Token-To-Atom Gather",
      "description": "Project token features to atom width and copy each token vector to atoms assigned to that token.",
      "math": [
        {
          "id": "project_token_state",
          "text": "h_token = Linear(token_state)",
          "tex": "h_j^{tok} = W\\,t_j",
          "operation": "projection"
        },
        {
          "id": "gather",
          "text": "atom_i = h_token[atom_to_token_i]",
          "tex": "a_i = h^{tok}_{\\operatorname{tok}(i)}",
          "operation": "gather"
        }
      ]
    },
    "coordinate_injection": {
      "id": "coordinate_injection",
      "name": "Coordinate Injection",
      "description": "Project coordinate features into a latent atom or token state.",
      "math": [
        {
          "id": "project_coordinates",
          "text": "delta = Linear(coord_features)",
          "tex": "\\Delta_i = W\\,\\phi(r_i)",
          "operation": "projection"
        },
        {
          "id": "inject_coordinates",
          "text": "state = state + delta",
          "tex": "h_i \\leftarrow h_i + \\Delta_i",
          "operation": "additive_injection"
        }
      ]
    }
  },
  "pseudocode": {
    "rfd3_diffusion_module": {
      "sourceYaml": "../../pseudocode/rfd3-diffusion-module.yaml",
      "lines": [
        {
          "id": "pad_atom14_slots",
          "text": "PadTokensWithVirtualAtoms(n_atoms_per_token=14, association_scheme='dense') -> atom14 slots with VX padding",
          "refs": "35-42, 139-145,198-223,263-290"
        },
        {
          "id": "token_initializer_call",
          "text": "initializer_outputs = TokenInitializer(f) -> Q_L_init, C_L, P_LL, S_I, Z_II",
          "refs": "77-87,96-104, 163-292"
        },
        {
          "id": "build_atom_pair_repr",
          "text": "P_LL = motif/ref atom-pair embeddings + process_single_l(C_L) + process_single_m(C_L)",
          "refs": "237-263"
        },
        {
          "id": "expand_token_pair_to_atom_pair",
          "text": "P_LL += process_z(Z_II)[tok_idx, tok_idx]; token pair state is expanded to atom-pair scale",
          "refs": "264-268"
        },
        {
          "id": "pool_atom_pair_back_to_token_pair",
          "text": "Z_II += pairwise_mean_pool(P_LL, tok_idx) after P_LL pair MLP",
          "refs": "268-278, 513-579"
        },
        {
          "id": "noisy_coords_to_atom_state",
          "text": "R_noisy_L = scale_positions_in(X_noisy_L); Q_L = Q_L_init + process_r(R_noisy_L)",
          "refs": "211-220"
        },
        {
          "id": "build_sparse_neighborhood",
          "text": "indices = create_attention_indices(X_noisy_L, f): sequence neighbors plus spatial nearest neighbors",
          "refs": "196-201, 199-204,316-320,397-399"
        },
        {
          "id": "atom_attention_pair_bias",
          "text": "LocalAttentionPairBias(Q_L, C_L, P_LL, indices): logits += Linear(P_LL)",
          "refs": "642-711, 206,264-275,337-340,426-440"
        },
        {
          "id": "atom_to_token_downcast",
          "text": "A_I = downcast_q(Q_L, A_I, S_I, tok_idx): group atom14 slots by token, then mean or cross-attend to token state",
          "refs": "225-240, 518-577"
        },
        {
          "id": "token_encoder_with_noisy_distogram",
          "text": "DiffusionTokenEncoder(..., R_L_uniform, D_II_self): add noisy representative-coordinate distogram features to Z_II",
          "refs": "319-328, 381-403"
        },
        {
          "id": "token_pairformer_updates_z",
          "text": "for block in pairformer: S_I, Z_II = block(S_I, Z_II)",
          "refs": "411-414"
        },
        {
          "id": "token_transformer_call",
          "text": "A_I = LocalTokenTransformer(A_I, S_I, Z_II, X_L=representative noisy/self coordinates)",
          "refs": "330-342, 589-639"
        },
        {
          "id": "token_attention_pair_bias",
          "text": "token LocalAttentionPairBias uses Z_II as pair bias while updating A_I",
          "refs": "663-711, 206,337-340,426-440"
        },
        {
          "id": "token_to_atom_upcast",
          "text": "Q_L = decoder.upcast_a(A_I, Q_L, C_L, tok_idx): copy/broadcast or cross-attend token output to atom14 slots",
          "refs": "347-373, 469-515,714-777"
        },
        {
          "id": "decoder_atom_attention_pair_bias",
          "text": "decoder LocalAtomTransformer(Q_L, C_L, P_LL, indices) again uses atom-pair bias",
          "refs": "347-373, 714-777, 206,337-340,426-440"
        },
        {
          "id": "coordinate_sequence_heads",
          "text": "R_update_L = to_r_update(Q_L); X_out_L = scale_positions_out(R_update_L); logits = seq_head(A_I)",
          "refs": "375-380"
        }
      ]
    }
  },
  "boards": {
    "sourceYaml": "../../views/rfd3-semantic-zoom.view.yaml",
    "rootBoard": "rfd3_overview",
    "items": [
      {
        "id": "rfd3_overview",
        "title": "RF Diffusion 3",
        "summary": "A one-block overview. Open the diffusion module to inspect atom14 slotting, atom-pair bias, token refinement, and atom decoding.",
        "scale_lanes": false,
        "grid": {
          "columns": 3,
          "rows": 3
        },
        "nodes": [
          {
            "id": "diffusion_module",
            "kind": "module",
            "label": "RFD3 diffusion module",
            "scale": "abstract",
            "role": "atom14/token denoising module for all-atom design",
            "detail": "atom14 slots -> atom attention -> token transformer -> atom decoder",
            "col": 2,
            "row": 2,
            "expandable": true
          }
        ]
      },
      {
        "id": "diffusion_module",
        "title": "RFD3 Diffusion Module",
        "summary": "RFD3 enters diffusion with atom14 slots and initializer outputs, updates atom and token streams, then predicts atom-coordinate updates.",
        "parent": "rfd3_overview",
        "grid": {
          "columns": 6,
          "rows": 5
        },
        "nodes": [
          {
            "id": "atom14_padding_pipeline",
            "kind": "module",
            "module_ref": "atom14_padding_pipeline",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 3,
            "expandable": true
          },
          {
            "id": "atom14_slots",
            "kind": "representation",
            "rep_ref": "atom14_slots",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 2,
            "row": 3
          },
          {
            "id": "token_initializer",
            "kind": "module",
            "module_ref": "token_initializer",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 2,
            "row": 2,
            "expandable": true
          },
          {
            "id": "atom_pair_repr",
            "kind": "representation",
            "rep_ref": "atom_pair_repr",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 3,
            "row": 1
          },
          {
            "id": "noisy_coordinates",
            "kind": "representation",
            "rep_ref": "noisy_coordinates",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 1,
            "row": 5
          },
          {
            "id": "atom_attention_encoder",
            "kind": "module",
            "module_ref": "atom_attention_encoder",
            "prominence": "primary",
            "treatment": "block",
            "col": 3,
            "row": 3,
            "expandable": true
          },
          {
            "id": "token_state",
            "kind": "representation",
            "rep_ref": "token_state",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 4,
            "row": 3
          },
          {
            "id": "diffusion_token_encoder",
            "kind": "module",
            "module_ref": "diffusion_token_encoder",
            "prominence": "primary",
            "treatment": "block",
            "col": 4,
            "row": 2,
            "expandable": true
          },
          {
            "id": "token_pair_repr",
            "kind": "representation",
            "rep_ref": "token_pair_repr",
            "prominence": "secondary",
            "treatment": "compact",
            "density": "compact",
            "col": 5,
            "row": 1
          },
          {
            "id": "diffusion_transformer",
            "kind": "module",
            "module_ref": "diffusion_transformer",
            "prominence": "primary",
            "treatment": "block",
            "col": 5,
            "row": 3,
            "expandable": true
          },
          {
            "id": "atom_attention_decoder",
            "kind": "module",
            "module_ref": "atom_attention_decoder",
            "prominence": "primary",
            "treatment": "block",
            "col": 6,
            "row": 3,
            "expandable": true
          },
          {
            "id": "coordinate_update",
            "kind": "representation",
            "rep_ref": "coordinate_update",
            "prominence": "context",
            "treatment": "chip",
            "density": "micro",
            "col": 6,
            "row": 5
          }
        ],
        "edges": [
          {
            "from": "atom14_padding_pipeline",
            "to": "atom14_slots",
            "label": "atom14 slots",
            "connection": {
              "title": "Atom14 padding to atom slots",
              "role": "fixed atom topology",
              "inside": "The dense design path pads each residue token to 14 atom slots, filling unused slots with VX virtual atoms."
            }
          },
          {
            "from": "atom14_slots",
            "to": "token_initializer",
            "label": "features",
            "connection": {
              "title": "Atom14 features into initializer",
              "role": "atom/token feature construction",
              "inside": "TokenInitializer consumes atom-level features and atom_to_token_map to build Q_L_init, C_L, P_LL, S_I, and Z_II."
            }
          },
          {
            "from": "token_initializer",
            "to": "atom_pair_repr",
            "label": "P_LL",
            "tone": "conditioning",
            "connection": {
              "title": "Initializer builds atom pair state",
              "role": "atom attention pair bias source",
              "inside": "P_LL combines motif/reference atom-pair terms, atom single outer terms, and token pair Z_II expanded through atom_to_token_map."
            }
          },
          {
            "from": "token_initializer",
            "to": "atom_attention_encoder",
            "label": "Q/C/P",
            "tone": "conditioning",
            "connection": {
              "title": "Initial atom streams into atom encoder",
              "role": "atom state and conditioning",
              "inside": "The atom encoder receives Q_L_init, C_L, and P_LL; C_L modulates attention blocks and P_LL is projected to pair-bias logits."
            }
          },
          {
            "from": "noisy_coordinates",
            "to": "atom_attention_encoder",
            "label": "noisy coords",
            "tone": "conditioning",
            "connection": {
              "title": "Noisy coordinates into atom encoder",
              "role": "coordinate injection and sparse neighborhood",
              "inside": "X_noisy_L is scaled to R_noisy_L, projected into Q_L, and used to build sequence/spatial sparse attention indices. It is not directly the P_LL pair-bias matrix."
            }
          },
          {
            "from": "atom_pair_repr",
            "to": "atom_attention_encoder",
            "label": "pair bias",
            "tone": "conditioning",
            "connection": {
              "title": "P_LL to atom attention",
              "role": "attention-logit pair bias",
              "inside": "LocalAttentionPairBias projects P_LL to per-head logits and adds it to QK attention logits for atom-local attention."
            }
          },
          {
            "from": "atom_attention_encoder",
            "to": "token_state",
            "label": "downcast",
            "connection": {
              "title": "Atom encoder to token state",
              "role": "atom-to-token compression",
              "inside": "The downcast groups atom14 slots by token and reduces them to token state using the configured mean or cross-attention downcast path."
            }
          },
          {
            "from": "token_initializer",
            "to": "diffusion_token_encoder",
            "label": "S/Z init",
            "tone": "conditioning",
            "connection": {
              "title": "Initial token state into token encoder",
              "role": "token single and pair initialization",
              "inside": "S_I and Z_II from TokenInitializer seed the token encoder; Z_II has already received pooled atom-pair information."
            }
          },
          {
            "from": "noisy_coordinates",
            "to": "diffusion_token_encoder",
            "label": "distogram",
            "tone": "conditioning",
            "connection": {
              "title": "Noisy representative coordinates into token pairs",
              "role": "coordinate-derived token pair features",
              "inside": "DiffusionTokenEncoder can add distogram features from representative atom coordinates before its pairformer stack updates Z_II."
            }
          },
          {
            "from": "diffusion_token_encoder",
            "to": "token_pair_repr",
            "label": "updated Z",
            "tone": "conditioning",
            "connection": {
              "title": "Token encoder updates Z_II",
              "role": "mutable token pair state",
              "inside": "Pairformer blocks update S_I and Z_II before LocalTokenTransformer consumes the pair state as attention bias."
            }
          },
          {
            "from": "token_state",
            "to": "diffusion_transformer",
            "label": "A_I",
            "connection": {
              "title": "Token state into LocalTokenTransformer",
              "role": "token attention state",
              "inside": "A_I is the token stream updated by local token attention."
            }
          },
          {
            "from": "token_pair_repr",
            "to": "diffusion_transformer",
            "label": "pair bias",
            "tone": "conditioning",
            "connection": {
              "title": "Z_II to token attention",
              "role": "token attention pair bias",
              "inside": "LocalTokenTransformer uses the updated Z_II as pair bias for token-scale local attention."
            }
          },
          {
            "from": "diffusion_transformer",
            "to": "atom_attention_decoder",
            "label": "upcast",
            "connection": {
              "title": "Token output to atom decoder",
              "role": "token-to-atom expansion",
              "inside": "The decoder upcasts token output back to atom14 slots by broadcast or cross-attention before atom-local decoding."
            }
          },
          {
            "from": "atom_pair_repr",
            "to": "atom_attention_decoder",
            "label": "pair bias",
            "tone": "conditioning",
            "connection": {
              "title": "P_LL to atom decoder attention",
              "role": "atom attention pair bias",
              "inside": "The decoder atom transformer uses the same atom-pair representation as pair bias while refining atom slot state."
            }
          },
          {
            "from": "atom_attention_decoder",
            "to": "coordinate_update",
            "label": "coord update",
            "connection": {
              "title": "Atom decoder to coordinate update",
              "role": "denoising output",
              "inside": "The decoded Q_L atom state is projected to R_update_L and scaled back to atom-coordinate updates; A_I also feeds the sequence head."
            }
          }
        ]
      },
      {
        "id": "atom14_padding_pipeline",
        "title": "Atom14 Padding Pipeline",
        "summary": "RFD3 dense design inputs pad every residue token to a fixed 14-slot atom block before the model sees them.",
        "parent": "diffusion_module",
        "grid": {
          "columns": 5,
          "rows": 3
        },
        "nodes": [
          {
            "id": "residue_tokens",
            "kind": "representation",
            "label": "residue tokens",
            "scale": "token",
            "role": "protein residues or design tokens",
            "col": 1,
            "row": 2
          },
          {
            "id": "pad_virtual_atoms",
            "kind": "operation",
            "label": "PadTokensWithVirtualAtoms",
            "scale": "atom",
            "role": "add VX virtual atoms until each token has 14 atom slots",
            "col": 3,
            "row": 2
          },
          {
            "id": "atom14_slots",
            "kind": "representation",
            "rep_ref": "atom14_slots",
            "col": 5,
            "row": 2
          },
          {
            "id": "atom_to_token_index",
            "kind": "representation",
            "rep_ref": "atom_to_token_index",
            "col": 5,
            "row": 3
          }
        ],
        "edges": [
          {
            "from": "residue_tokens",
            "to": "pad_virtual_atoms",
            "label": "dense scheme",
            "connection": {
              "title": "Residue token to atom14 block",
              "role": "fixed-width atom layout",
              "inside": "The dense association scheme creates a predictable 14-slot atom layout for each residue token."
            }
          },
          {
            "from": "pad_virtual_atoms",
            "to": "atom14_slots",
            "label": "atom slots",
            "connection": {
              "title": "Virtual atom padding",
              "role": "atom-level tensor construction",
              "inside": "Missing slots are filled with VX virtual atom records rather than dropping the slot from the atom tensor."
            }
          },
          {
            "from": "pad_virtual_atoms",
            "to": "atom_to_token_index",
            "label": "owner map",
            "connection": {
              "title": "Atom-to-token ownership",
              "role": "grouping index",
              "inside": "The atom_to_token map records which residue token owns each atom slot and is reused by downcast/upcast operations."
            }
          }
        ]
      },
      {
        "id": "token_initializer",
        "title": "TokenInitializer",
        "summary": "The initializer builds both token-scale features and atom-scale conditioning, including the atom-pair P_LL bias source.",
        "parent": "diffusion_module",
        "grid": {
          "columns": 5,
          "rows": 4
        },
        "nodes": [
          {
            "id": "atom14_slots",
            "kind": "representation",
            "rep_ref": "atom14_slots",
            "col": 1,
            "row": 3
          },
          {
            "id": "token_embeds",
            "kind": "operation",
            "label": "token and atom 1D embedders",
            "scale": "mixed",
            "role": "build initial S_I and Q_L_init",
            "col": 2,
            "row": 2
          },
          {
            "id": "z_initializer",
            "kind": "operation",
            "label": "token pair initializer",
            "scale": "token_pair",
            "role": "outer sum, RPE, token bonds, and pairformer",
            "col": 3,
            "row": 1
          },
          {
            "id": "p_ll_builder",
            "kind": "operation",
            "label": "P_LL builder",
            "scale": "atom_pair",
            "role": "atom-pair reference/motif terms plus expanded Z_II",
            "col": 3,
            "row": 3
          },
          {
            "id": "atom_pair_repr",
            "kind": "representation",
            "rep_ref": "atom_pair_repr",
            "col": 5,
            "row": 3
          },
          {
            "id": "token_pair_repr",
            "kind": "representation",
            "rep_ref": "token_pair_repr",
            "col": 5,
            "row": 1
          },
          {
            "id": "atom_conditioning",
            "kind": "representation",
            "rep_ref": "atom_conditioning",
            "col": 5,
            "row": 4
          }
        ],
        "edges": [
          {
            "from": "atom14_slots",
            "to": "token_embeds",
            "label": "atom/token feats",
            "connection": {
              "title": "Atom14 feature embedding",
              "role": "initial single streams",
              "inside": "Atom and token feature embedders initialize Q_L_init, C_L, and S_I before diffusion."
            }
          },
          {
            "from": "token_embeds",
            "to": "z_initializer",
            "label": "S init",
            "connection": {
              "title": "Token singles seed token pairs",
              "role": "token pair construction",
              "inside": "Token pair features begin from processed token singles, relative position encoding, token bonds, and pairformer updates."
            }
          },
          {
            "from": "z_initializer",
            "to": "p_ll_builder",
            "label": "expand Z",
            "tone": "conditioning",
            "connection": {
              "title": "Token pair expands to atom pair",
              "role": "atom-pair bias construction",
              "inside": "process_z(Z_II) is indexed by atom_to_token on both atom axes and added into P_LL."
            }
          },
          {
            "from": "token_embeds",
            "to": "p_ll_builder",
            "label": "C outer",
            "tone": "conditioning",
            "connection": {
              "title": "Atom singles into P_LL",
              "role": "atom-pair single terms",
              "inside": "C_L contributes row and column single terms before the P_LL pair MLP."
            }
          },
          {
            "from": "p_ll_builder",
            "to": "atom_pair_repr",
            "label": "P_LL",
            "tone": "conditioning",
            "connection": {
              "title": "Atom pair output",
              "role": "atom attention bias source",
              "inside": "P_LL is retained as the atom-pair representation for atom encoder and decoder attention."
            }
          },
          {
            "from": "p_ll_builder",
            "to": "token_pair_repr",
            "label": "mean pool",
            "connection": {
              "title": "Atom pair to token pair feedback",
              "role": "token pair enrichment",
              "inside": "pairwise_mean_pool(P_LL, atom_to_token_map) feeds atom-pair information back into Z_II."
            }
          },
          {
            "from": "token_embeds",
            "to": "atom_conditioning",
            "label": "C_L",
            "tone": "conditioning",
            "connection": {
              "title": "Atom conditioning output",
              "role": "AdaLN conditioning",
              "inside": "C_L is carried to atom encoder and decoder blocks as the conditioning stream."
            }
          }
        ]
      },
      {
        "id": "atom_attention_encoder",
        "title": "LocalAtomTransformer Encoder",
        "summary": "The atom encoder injects noisy coordinates into Q_L, builds local sparse attention neighborhoods, uses P_LL pair bias, and downcasts atom slots to token state.",
        "parent": "diffusion_module",
        "grid": {
          "columns": 5,
          "rows": 4
        },
        "nodes": [
          {
            "id": "noisy_coordinates",
            "kind": "representation",
            "rep_ref": "noisy_coordinates",
            "col": 1,
            "row": 4
          },
          {
            "id": "atom_state",
            "kind": "representation",
            "rep_ref": "atom_state",
            "col": 1,
            "row": 2
          },
          {
            "id": "atom_conditioning",
            "kind": "representation",
            "rep_ref": "atom_conditioning",
            "col": 1,
            "row": 1
          },
          {
            "id": "atom_pair_repr",
            "kind": "representation",
            "rep_ref": "atom_pair_repr",
            "col": 1,
            "row": 3
          },
          {
            "id": "local_atom_attention",
            "kind": "operation",
            "label": "LocalAttentionPairBias x3",
            "scale": "atom",
            "role": "sparse atom attention with P_LL bias and C_L modulation",
            "col": 3,
            "row": 2
          },
          {
            "id": "downcast",
            "kind": "operation",
            "label": "Downcast",
            "scale": "token",
            "role": "group atom14 slots by token, then mean or cross-attend",
            "col": 4,
            "row": 3
          },
          {
            "id": "token_state",
            "kind": "representation",
            "rep_ref": "token_state",
            "col": 5,
            "row": 3
          }
        ],
        "edges": [
          {
            "from": "noisy_coordinates",
            "to": "local_atom_attention",
            "label": "Q + indices",
            "tone": "conditioning",
            "connection": {
              "title": "Noisy coordinate effects",
              "role": "state injection and sparsity",
              "inside": "Coordinates are projected into Q_L and used to derive sparse local attention indices."
            }
          },
          {
            "from": "atom_conditioning",
            "to": "local_atom_attention",
            "label": "AdaLN",
            "tone": "conditioning",
            "connection": {
              "title": "Atom conditioning to attention block",
              "role": "adaptive normalization",
              "inside": "C_L conditions attention blocks through AdaLN-style modulation."
            }
          },
          {
            "from": "atom_pair_repr",
            "to": "local_atom_attention",
            "label": "pair bias",
            "tone": "conditioning",
            "connection": {
              "title": "P_LL to atom attention logits",
              "role": "pair-bias addition",
              "inside": "P_LL is linearly projected to per-head pair bias and added to QK logits."
            }
          },
          {
            "from": "atom_state",
            "to": "local_atom_attention",
            "label": "Q_L",
            "connection": {
              "title": "Atom state through local attention",
              "role": "atom state update",
              "inside": "Q_L is updated by three local atom transformer blocks in the default config."
            }
          },
          {
            "from": "local_atom_attention",
            "to": "downcast",
            "label": "atom output",
            "connection": {
              "title": "Atom output to downcast",
              "role": "atom-to-token transition",
              "inside": "Updated atom states are grouped by atom_to_token before token-scale processing."
            }
          },
          {
            "from": "downcast",
            "to": "token_state",
            "label": "A_I",
            "connection": {
              "title": "Downcast token state",
              "role": "compressed token representation",
              "inside": "The configured downcast path produces token state A_I for later token modules."
            }
          }
        ]
      },
      {
        "id": "diffusion_token_encoder",
        "title": "DiffusionTokenEncoder",
        "summary": "The token encoder updates S_I and Z_II before token attention, including optional noisy representative-coordinate distogram features.",
        "parent": "diffusion_module",
        "grid": {
          "columns": 5,
          "rows": 3
        },
        "nodes": [
          {
            "id": "token_state",
            "kind": "representation",
            "rep_ref": "token_state",
            "col": 1,
            "row": 2
          },
          {
            "id": "token_pair_repr_in",
            "kind": "representation",
            "rep_ref": "token_pair_repr",
            "label": "Z_II init",
            "col": 1,
            "row": 1
          },
          {
            "id": "noisy_coordinates",
            "kind": "representation",
            "rep_ref": "noisy_coordinates",
            "col": 1,
            "row": 3
          },
          {
            "id": "distogram",
            "kind": "operation",
            "label": "representative distogram",
            "scale": "token_pair",
            "role": "coordinate-derived token pair features",
            "col": 3,
            "row": 3
          },
          {
            "id": "pairformer",
            "kind": "operation",
            "label": "pairformer x2",
            "scale": "token_pair",
            "role": "update S_I and Z_II",
            "col": 3,
            "row": 1
          },
          {
            "id": "token_pair_repr",
            "kind": "representation",
            "rep_ref": "token_pair_repr",
            "label": "updated Z_II",
            "col": 5,
            "row": 1
          },
          {
            "id": "token_state_out",
            "kind": "representation",
            "rep_ref": "token_state",
            "label": "updated S/A",
            "col": 5,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "noisy_coordinates",
            "to": "distogram",
            "label": "CA/self distances",
            "tone": "conditioning",
            "connection": {
              "title": "Noisy representative distances",
              "role": "token pair coordinate feature",
              "inside": "DiffusionTokenEncoder uses representative atom coordinates to form token-pair distogram features."
            }
          },
          {
            "from": "token_pair_repr_in",
            "to": "pairformer",
            "label": "Z in",
            "tone": "conditioning",
            "connection": {
              "title": "Initial Z_II into pairformer",
              "role": "mutable pair state",
              "inside": "Z_II is not just a fixed bias here; pairformer blocks update it before token attention."
            }
          },
          {
            "from": "distogram",
            "to": "pairformer",
            "label": "pair coord feats",
            "tone": "conditioning",
            "connection": {
              "title": "Distogram features into Z_II",
              "role": "structure conditioning",
              "inside": "Coordinate-derived token pair features are added before the pairformer stack."
            }
          },
          {
            "from": "token_state",
            "to": "pairformer",
            "label": "S/A",
            "connection": {
              "title": "Token singles into pairformer",
              "role": "token single update",
              "inside": "Pairformer blocks update token single and pair streams together."
            }
          },
          {
            "from": "pairformer",
            "to": "token_pair_repr",
            "label": "Z out",
            "connection": {
              "title": "Updated token pair state",
              "role": "pair-bias source for token transformer",
              "inside": "The resulting Z_II is consumed by LocalTokenTransformer attention."
            }
          },
          {
            "from": "pairformer",
            "to": "token_state_out",
            "label": "S out",
            "connection": {
              "title": "Updated token single state",
              "role": "token conditioning",
              "inside": "Updated token singles condition the local token transformer blocks."
            }
          }
        ]
      },
      {
        "id": "diffusion_transformer",
        "title": "LocalTokenTransformer",
        "summary": "The 18-block token transformer updates A_I with local structure-aware token attention, using Z_II as pair bias.",
        "parent": "diffusion_module",
        "grid": {
          "columns": 5,
          "rows": 3
        },
        "nodes": [
          {
            "id": "token_state",
            "kind": "representation",
            "rep_ref": "token_state",
            "col": 1,
            "row": 2
          },
          {
            "id": "token_pair_repr",
            "kind": "representation",
            "rep_ref": "token_pair_repr",
            "col": 1,
            "row": 1
          },
          {
            "id": "noisy_coordinates",
            "kind": "representation",
            "rep_ref": "noisy_coordinates",
            "col": 1,
            "row": 3
          },
          {
            "id": "local_token_attention",
            "kind": "operation",
            "label": "LocalAttentionPairBias x18",
            "scale": "token",
            "role": "sparse token attention with Z_II pair bias",
            "col": 3,
            "row": 2
          },
          {
            "id": "token_state_out",
            "kind": "representation",
            "rep_ref": "token_state",
            "label": "token output",
            "col": 5,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "token_state",
            "to": "local_token_attention",
            "label": "A_I",
            "connection": {
              "title": "Token state into transformer",
              "role": "mutable token stream",
              "inside": "A_I is the state being updated by the token transformer."
            }
          },
          {
            "from": "token_pair_repr",
            "to": "local_token_attention",
            "label": "pair bias",
            "tone": "conditioning",
            "connection": {
              "title": "Z_II pair bias",
              "role": "token attention-logit bias",
              "inside": "Z_II is projected to pair-bias logits inside token LocalAttentionPairBias blocks."
            }
          },
          {
            "from": "noisy_coordinates",
            "to": "local_token_attention",
            "label": "local indices",
            "tone": "conditioning",
            "connection": {
              "title": "Structure-local token attention",
              "role": "sparse attention neighborhood",
              "inside": "Representative coordinates define the structure-local token attention indices."
            }
          },
          {
            "from": "local_token_attention",
            "to": "token_state_out",
            "label": "A_I out",
            "connection": {
              "title": "Token transformer output",
              "role": "decoder input",
              "inside": "The refined token state is upcast back to atom slots in the atom decoder."
            }
          }
        ]
      },
      {
        "id": "atom_attention_decoder",
        "title": "CompactStreamingDecoder",
        "summary": "The decoder expands token output back to atom14 slots, runs atom-local attention with P_LL pair bias, and produces coordinate updates.",
        "parent": "diffusion_module",
        "grid": {
          "columns": 5,
          "rows": 4
        },
        "nodes": [
          {
            "id": "token_state",
            "kind": "representation",
            "rep_ref": "token_state",
            "col": 1,
            "row": 2
          },
          {
            "id": "atom_pair_repr",
            "kind": "representation",
            "rep_ref": "atom_pair_repr",
            "col": 1,
            "row": 1
          },
          {
            "id": "atom_conditioning",
            "kind": "representation",
            "rep_ref": "atom_conditioning",
            "col": 1,
            "row": 3
          },
          {
            "id": "upcast",
            "kind": "operation",
            "label": "Upcast",
            "scale": "atom",
            "role": "copy/broadcast or cross-attend token output to atom14 slots",
            "col": 2,
            "row": 2
          },
          {
            "id": "decoder_attention",
            "kind": "operation",
            "label": "LocalAttentionPairBias x3",
            "scale": "atom",
            "role": "atom-local decoder attention with P_LL bias",
            "col": 3,
            "row": 2
          },
          {
            "id": "coordinate_sequence_heads",
            "kind": "module",
            "module_ref": "coordinate_sequence_heads",
            "col": 4,
            "row": 2
          },
          {
            "id": "coordinate_update",
            "kind": "representation",
            "rep_ref": "coordinate_update",
            "col": 5,
            "row": 2
          }
        ],
        "edges": [
          {
            "from": "token_state",
            "to": "upcast",
            "label": "token out",
            "connection": {
              "title": "Token to atom slots",
              "role": "token-to-atom scale transition",
              "inside": "The decoder maps token output back into each token's atom14 slots."
            }
          },
          {
            "from": "upcast",
            "to": "decoder_attention",
            "label": "Q_L",
            "connection": {
              "title": "Upcast state into atom decoder",
              "role": "atom decoder state",
              "inside": "Upcast atom state is combined with atom skip state before local atom attention."
            }
          },
          {
            "from": "atom_conditioning",
            "to": "decoder_attention",
            "label": "AdaLN",
            "tone": "conditioning",
            "connection": {
              "title": "Atom conditioning in decoder",
              "role": "adaptive normalization",
              "inside": "C_L still conditions decoder atom attention blocks."
            }
          },
          {
            "from": "atom_pair_repr",
            "to": "decoder_attention",
            "label": "pair bias",
            "tone": "conditioning",
            "connection": {
              "title": "P_LL in decoder attention",
              "role": "attention-logit pair bias",
              "inside": "The decoder reuses atom-pair P_LL as pair bias while producing final atom state."
            }
          },
          {
            "from": "decoder_attention",
            "to": "coordinate_sequence_heads",
            "label": "decoded Q",
            "connection": {
              "title": "Decoded atom state to output heads",
              "role": "output projection input",
              "inside": "Decoded Q_L feeds the coordinate update projection; token state feeds the sequence head."
            }
          },
          {
            "from": "coordinate_sequence_heads",
            "to": "coordinate_update",
            "label": "X out",
            "connection": {
              "title": "Coordinate update",
              "role": "denoised atom positions",
              "inside": "to_r_update(Q_L) predicts atom-coordinate updates for the current diffusion step."
            }
          }
        ]
      }
    ]
  }
};
